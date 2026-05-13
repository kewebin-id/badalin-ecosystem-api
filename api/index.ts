import { bootstrap } from '../src/main';

export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};
