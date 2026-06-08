// src/pipeline/core/dataIngestionPipeline.js
import EventEmitter from 'events';
import { PipelineLogger } from '../monitoring/pipelineLogger.js';
import { JobQueueManager } from '../queue/jobQueueManager.js';
import { MarketDataProcessor } from '../processors/marketDataProcessor.js';
import { FeedConnectionManager } from './feedConnectionManager.js';
import { ApiRateLimiter } from './apiRateLimiter.js';
import { PipelineHealthMonitor } from '../monitoring/pipelineHealthMonitor.js';
import { clearTimer } from '../utils/asyncUtils.js';
import { createMessageId } from '../utils/idGenerator.js';
import { validateConnectableSource } from '../utils/sourceConfig.js';

/**
 * Main data ingestion pipeline orchestrating all components
 * Similar to Aladdin's data management capabilities
 */
export class DataIngestionPipeline extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.logger = new PipelineLogger('DataIngestionPipeline');
    this.options = {
      maxConcurrentConnections: 50,
      retryAttempts: 3,
      retryDelay: 1000,
      healthCheckInterval: 30000,
      sourceStaleAfterMs: 60000,
      ...options
    };

    // Core components
    this.connectionManager = new FeedConnectionManager(this.options);
    this.queueManager = new JobQueueManager(this.options);
    this.dataProcessor = new MarketDataProcessor(this.options);
    this.rateLimiter = new ApiRateLimiter(this.options);
    this.healthChecker = new PipelineHealthMonitor(this.options);

    // DataIngestionPipeline state
    this.isInitialized = false;
    this.isRunning = false;
    this.sources = new Map();
    this.metrics = {
      messagesProcessed: 0,
      messagesPerSecond: 0,
      errors: 0,
      lastProcessed: null,
      uptime: 0
    };

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for component communication
   */
  setupEventHandlers() {
    this.connectionManager.on('data', this.handleIncomingData.bind(this));
    this.connectionManager.on('error', this.handleConnectionError.bind(this));
    this.connectionManager.on('connected', this.handleConnectionEstablished.bind(this));
    this.connectionManager.on('disconnected', this.handleConnectionLost.bind(this));

    this.queueManager.on('processed', this.updateMetrics.bind(this));
    this.queueManager.on('error', this.handleQueueError.bind(this));
    this.queueManager.on('process-data', this.processQueuedData.bind(this));

    this.dataProcessor.on('transformed', this.handleTransformedData.bind(this));
    this.dataProcessor.on('validation-error', this.handleValidationError.bind(this));

    this.healthChecker.on('unhealthy', this.handleUnhealthyComponent.bind(this));
  }

  /**
   * Initialize pipeline components once before accepting data.
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.warn('Data ingestion pipeline already initialized');
      return;
    }

    try {
      this.logger.info('Initializing data ingestion pipeline');

      await this.queueManager.initialize();
      await this.dataProcessor.initialize();
      await this.rateLimiter.initialize();
      await this.healthChecker.initialize();

      this.startHealthChecks();
      this.isInitialized = true;

      this.logger.info('Data ingestion pipeline initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize data ingestion pipeline', error);
      throw error;
    }
  }

  /**
   * Start the data ingestion pipeline.
   */
  async start() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.isRunning) {
        this.logger.warn('Data ingestion pipeline already running');
        return;
      }

      this.logger.info('Starting data ingestion pipeline');

      this.isRunning = true;
      this.metrics.startTime = Date.now();

      this.logger.info('Data ingestion pipeline started successfully');
      this.emit('started');

    } catch (error) {
      this.logger.error('Failed to start data ingestion pipeline', error);
      throw error;
    }
  }

  /**
   * Stop the pipeline and cleanup resources
   */
  async stop() {
    try {
      this.logger.info('Stopping data ingestion pipeline');
      
      this.isRunning = false;
      this.isInitialized = false;
      
      clearTimer(this.healthCheckInterval);
      this.healthCheckInterval = null;

      // Stop all components
      await this.connectionManager.closeAll();
      await this.queueManager.shutdown();
      await this.dataProcessor.shutdown();
      await this.rateLimiter.shutdown();
      await this.healthChecker.shutdown();

      this.logger.info('DataIngestionPipeline stopped successfully');
      this.emit('stopped');

    } catch (error) {
      this.logger.error('Error stopping pipeline', error);
      throw error;
    }
  }

  /**
   * Add a data source to the pipeline
   */
  async addSource(sourceConfig) {
    try {
      if (!this.validateSourceConfig(sourceConfig)) {
        throw new Error('Invalid source configuration');
      }

      const { id, type, url, headers, options } = sourceConfig;
      
      // Check rate limits
      const canConnect = await this.rateLimiter.checkLimit(id);
      if (!canConnect) {
        throw new Error(`Rate limit exceeded for source: ${id}`);
      }

      // Create connection
      const connection = await this.connectionManager.connect({
        id,
        type,
        url,
        headers,
        options: {
          ...options,
          onReconnect: async () => {
            this.logger.info(`Reconnecting to source: ${id}`);
            await this.handleReconnection(id);
          }
        }
      });

      this.sources.set(id, {
        ...sourceConfig,
        connection,
        status: 'connected',
        lastData: null,
        errorCount: 0
      });

      this.logger.info(`Added source: ${id} (${type})`);
      this.emit('source-added', { id, type });

    } catch (error) {
      this.logger.error(`Failed to add source: ${sourceConfig.id}`, error);
      throw error;
    }
  }

  /**
   * Remove a data source from the pipeline
   */
  async removeSource(sourceId) {
    try {
      const source = this.sources.get(sourceId);
      if (!source) {
        throw new Error(`Source not found: ${sourceId}`);
      }

      await this.connectionManager.disconnect(sourceId);
      this.sources.delete(sourceId);

      this.logger.info(`Removed source: ${sourceId}`);
      this.emit('source-removed', { id: sourceId });

    } catch (error) {
      this.logger.error(`Failed to remove source: ${sourceId}`, error);
      throw error;
    }
  }

  /**
   * Handle incoming data from connections
   */
  async handleIncomingData(sourceId, data) {
    try {
      if (!this.isRunning) return;

      // Update source status
      const source = this.sources.get(sourceId);
      if (source) {
        source.lastData = Date.now();
      }

      // Add to processing queue
      await this.queueManager.add('data-processing', {
        sourceId,
        data,
        timestamp: Date.now(),
        messageId: this.generateMessageId()
      });

    } catch (error) {
      this.logger.error(`Error handling data from ${sourceId}`, error);
      this.handleError(sourceId, error);
    }
  }

  /**
   * Run a queued payload through the processor and resolve the queue job.
   */
  async processQueuedData(payload, job) {
    try {
      const processed = await this.dataProcessor.processData(payload);
      this.queueManager.emit(`processed-${job.id}`, processed);
      return processed;
    } catch (error) {
      this.queueManager.emit(`error-${job.id}`, error);
    }
  }

  /**
   * Handle transformed data from processor
   */
  async handleTransformedData(data) {
    try {
      this.emit('data', data);
      this.updateMetrics({ type: 'processed', data });

    } catch (error) {
      this.logger.error('Error handling transformed data', error);
    }
  }

  /**
   * Handle connection errors
   */
  async handleConnectionError(sourceId, error) {
    const source = this.sources.get(sourceId);
    if (!source) return;

    source.errorCount++;
    source.status = 'error';

    this.logger.error(`Connection error for ${sourceId}`, error);

    // Implement exponential backoff
    if (source.errorCount <= this.options.retryAttempts) {
      const delay = this.options.retryDelay * Math.pow(2, source.errorCount - 1);
      
      setTimeout(async () => {
        try {
          await this.reconnectSource(sourceId);
        } catch (reconnectError) {
          this.logger.error(`Failed to reconnect ${sourceId}`, reconnectError);
        }
      }, delay);
    } else {
      this.logger.error(`Max retries exceeded for ${sourceId}, marking as failed`);
      source.status = 'failed';
      this.emit('source-failed', { id: sourceId, error });
    }
  }

  /**
   * Reconnect a failed source
   */
  async reconnectSource(sourceId) {
    const source = this.sources.get(sourceId);
    if (!source) return;

    try {
      const connection = await this.connectionManager.reconnect(sourceId);
      source.connection = connection;
      source.status = 'connected';
      source.errorCount = 0;

      this.logger.info(`Successfully reconnected ${sourceId}`);
      this.emit('source-reconnected', { id: sourceId });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Start health monitoring
   */
  startHealthChecks() {
    clearTimer(this.healthCheckInterval);
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealth();
        this.emit('health-check', health);

        // Check for unhealthy sources
        for (const [sourceId, source] of this.sources.entries()) {
          if (source.status === 'error' || source.status === 'failed') {
            this.emit('source-unhealthy', { id: sourceId, source });
          }
        }

      } catch (error) {
        this.logger.error('Health check failed', error);
      }
    }, this.options.healthCheckInterval);
  }

  /**
   * Get pipeline health status
   */
  async getHealth() {
    const now = Date.now();
    const uptime = this.metrics.startTime ? now - this.metrics.startTime : 0;

    const sourceStatus = Array.from(this.sources.entries()).map(([id, source]) => ({
      id,
      status: source.status,
      lastData: source.lastData,
      errorCount: source.errorCount,
      isHealthy: source.status === 'connected' && (!source.lastData || (now - source.lastData) < this.options.sourceStaleAfterMs)
    }));

    const healthySources = sourceStatus.filter(s => s.isHealthy).length;
    const totalSources = sourceStatus.length;

    return {
      pipeline: {
        status: this.isRunning ? 'running' : 'stopped',
        uptime,
        metrics: this.metrics
      },
      sources: {
        total: totalSources,
        healthy: healthySources,
        unhealthy: totalSources - healthySources,
        details: sourceStatus
      },
      components: {
        connectionManager: await this.connectionManager.getHealth(),
        queueManager: await this.queueManager.getHealth(),
        dataProcessor: await this.dataProcessor.getHealth(),
        rateLimiter: await this.rateLimiter.getHealth()
      }
    };
  }

  /**
   * Update pipeline metrics
   */
  updateMetrics(event) {
    const now = Date.now();
    
    switch (event.type) {
      case 'processed':
        this.metrics.messagesProcessed++;
        this.metrics.lastProcessed = now;
        break;
      case 'error':
        this.metrics.errors++;
        break;
    }

    // Calculate messages per second
    if (this.metrics.startTime) {
      const elapsed = Math.max((now - this.metrics.startTime) / 1000, 1);
      this.metrics.messagesPerSecond = Math.round(this.metrics.messagesProcessed / elapsed);
      this.metrics.uptime = elapsed;
    }
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return createMessageId();
  }

  /**
   * Validate source configuration
   */
  validateSourceConfig(config) {
    return validateConnectableSource(config);
  }

  /**
   * Handle various error types
   */
  handleError(sourceId, error) {
    this.updateMetrics({ type: 'error', sourceId, error });
    this.emit('error', { sourceId, error });
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    clearTimer(this.healthCheckInterval);
    this.healthCheckInterval = null;

    if (this.isRunning || this.isInitialized) {
      await this.stop();
    }
  }
}

export { DataIngestionPipeline as Pipeline };
