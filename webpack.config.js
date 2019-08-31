const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = [
  {
    name: 'umd',
    mode: 'production',
    target: "web",

    entry: {
      mapView: './src/js/map.js'
    },
    output: {
      filename: '[name].min.js',
      path: __dirname + '/dist',
      library: 'mapView',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    }
  },
  {
    name: 'dev',
    mode: 'development',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      writeToDisk: false,
      hot: true,
      inline: true
    },
    entry: {
      index: './index.js'
    },
     module: {
      rules: [{
        test: /\.html$/,
        use: [ {
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
    },
     plugins: [
      // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Hot Module Replacement',
        template: './src/index.html'
      })
    ],
    output: {
      filename: '[name].min.js',
      path: __dirname + '/dist',
      library: 'mapView',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    }
  }
];