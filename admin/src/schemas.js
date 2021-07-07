import { object, string } from 'yup';

const shopFormSchema = object().shape({
  displayName: string().max(50, 'Settings.shops.modal.shops.displayName.error'),
});

export default shopFormSchema;
