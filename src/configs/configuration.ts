export default () => ({
  port: parseInt(process.env.PORT ?? '5500', 10),
});
