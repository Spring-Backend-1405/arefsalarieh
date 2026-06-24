import bcrypt from 'bcryptjs'

const hashPassword = async (password : string) => {
  const hashedPassword = await bcrypt.hashSync(password, 10);
  return hashedPassword;
};
const comparePassword = async (password : string, hashPassword : string) => {
  const checkPassword = await bcrypt.compare(password, hashPassword);
  return checkPassword;
};

export {hashPassword , comparePassword}