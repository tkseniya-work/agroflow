module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            utils: './src/utils',
            screens: './src/screens',
            navigation: './src/navigation',
            hooks: './src/hooks',
            widgets: './widgets',
            shared: './shared',
            styles: './shared/styles',
            assets: './src/assets',
            constants: './src/constants',
            i18n: './src/i18n',
            configs: './src/configs',
            types: './src/types',
          },
        },
      ],
      ['react-native-reanimated/plugin'],
      ["inline-import", { extensions: [".sql"] }]
    ],
  };
};
