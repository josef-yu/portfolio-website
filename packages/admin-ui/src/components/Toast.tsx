interface ToastProps {
  msg: string;
  type: 'ok' | 'err' | '';
}

export default function Toast({ msg, type }: ToastProps) {
  return (
    <div className={`toast show${type ? ` ${type}` : ''}`}>{msg}</div>
  );
}
