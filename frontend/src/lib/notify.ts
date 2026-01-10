import toast from 'react-hot-toast';

type NotifyOptions = {
  id?: string;
};

export const notify = {
  success: (message: string, options: NotifyOptions = {}) =>
  {
    toast.success(message, { id: options.id });
  },
  error: (message: string, options: NotifyOptions = {}) =>
  {
    toast.error(message, { id: options.id });
  },
  dismiss: (id?: string) =>
  {
    toast.dismiss(id);
  },
};
