import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';

const objectTransformer = <T>(Model: ClassType<T>) => {
  return (v: unknown) => {
    return typeof v === 'number' || typeof v === 'string'
      ? plainToClass(Model, { id: Number(v) })
      : v;
  };
};

export default objectTransformer;
