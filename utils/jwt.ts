
const parseJwt = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    } catch (e) {
      return null;
    }
  };

export { parseJwt };