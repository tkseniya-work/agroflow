export default ({ config }) => {
  const store = process.env.APP_STORE || 'googleplay';

  return {
    ...config,
    name: 'AgroFlow',
    android: {
      ...config.android,
      package: 'com.example.agroflow',
    },
    extra: {
      ...config.extra,
      store,
    },
  };
};
