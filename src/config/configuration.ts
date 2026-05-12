export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 3000,
  mongo_url: process.env.MONGO_URL,
  jwt: {
    access_key: process.env.ACC_T_SC,
    access_ex: parseInt(process.env.ACC_T_EX as string, 10) || 600,
    refresh_key: process.env.REF_T_SC,
    refresh_ex: process.env.REF_T_EX,
  },
});
