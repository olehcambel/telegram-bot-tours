import Form from '../../entity/form';

// TODO: create abstract type to pass Extracted and Entity => Create | Update
// TODO: autogene type from Infer <Entity>
type Extracted = 'user' | 'formStatus' | 'currency' | 'country';

// Partial<Form> as id: required
type NonRelation = Omit<Form, Extracted | 'id' | 'createdAt' | 'updatedAt'>;

export type FormDto = NonRelation & Record<Extracted, number>;

export type FormUpdate = Partial<FormDto> & Pick<Form, 'id'>;

// const t: FormDto = {
//     user
// }

// export interface FormDto {
//   peopleCount: string;
//   dateFrom: string;
//   dateTo: string;
//   comment: string;
//   priceFrom: string;
//   priceTo: string;
//   currency: string;
//   country: string;
//   formStatus: string;
//   user: string;
// }
