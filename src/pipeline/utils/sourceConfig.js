// src/pipeline/utils/sourceConfig.js

export function normalizeSourceConfig(sourceConfig = {}) {
  const {
    config: nestedConfig = {},
    options: sourceOptions = {},
    enabled = true,
    ...baseConfig
  } = sourceConfig;

  const {
    options: nestedOptions = {},
    ...flattenedNestedConfig
  } = nestedConfig || {};

  return {
    ...baseConfig,
    ...flattenedNestedConfig,
    id: sourceConfig.id,
    type: sourceConfig.type,
    enabled,
    options: {
      ...sourceOptions,
      ...nestedOptions
    },
    rawConfig: sourceConfig
  };
}

export function validateConfiguredSource(config = {}) {
  return Boolean(config.id && config.type);
}

export function validateConnectableSource(config = {}) {
  return Boolean(config.id && config.type && config.url);
}
