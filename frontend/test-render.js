require('@babel/register')({ presets: ['@babel/preset-env', ['@babel/preset-react', {runtime: 'automatic'}]] });
const React = require('react');
const { renderToString } = require('react-dom/server');

try {
  const SuperAdminDashboardHome = require('./src/pages/components/SuperAdminDashboardHome').default;
  const html = renderToString(React.createElement(SuperAdminDashboardHome, { stats: {} }));
  console.log('RENDER SUCCESS. Length:', html.length);
} catch (e) {
  console.error('RENDER ERROR:', e);
}
