import Swal from 'sweetalert2';

export const Popup = (attr, title, description ) => {
  switch (attr) {
    case 'loading':
      Swal.fire({
        width: 400,
        title: title || 'Loading...',
        text: description || '',
        didOpen: () => {
          Swal.showLoading();
        }
      });
      break;

    case 'success':
      Swal.fire({
        width: 400,
        icon: 'success',
        title: title || 'Success',
        text: description || 'Operation was successful.',
      });
      break;

    case 'error':
      Swal.fire({
        width: 400,
        icon: 'error',
        title: title || 'Error',
        text: description || 'Something went wrong.',
      });
      break;

    case 'warning':
      Swal.fire({
        width: 400,
        icon: 'warning',
        title: title || 'Warning',
        text: description || 'Please be careful.',
      });
      break;

    default:
      Swal.fire({
        width: 400,
        title: title || 'Notice',
        text: description || '',
      });
      break;
  }

  return null;
};