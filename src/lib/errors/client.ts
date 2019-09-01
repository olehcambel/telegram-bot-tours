export default class ClientError extends Error {
  name: string = 'ClientError';

  templateData?: Object;

  constructor(message: string, templateData?: Object) {
    super(message);
    this.templateData = templateData;
  }
}
