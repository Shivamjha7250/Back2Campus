
import { 
  CheckCircleIcon, 
  ExclamationIcon, 
  InformationCircleIcon 
} from '../common/Icons'; 

const Alert = ({ type = 'info', message }) => {
  
  const Icon = {
    success: CheckCircleIcon,
    error: ExclamationIcon,
    warning: ExclamationIcon,
    info: InformationCircleIcon
  }[type];

  
  const alertClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }[type];

  return (
    <div className={`${alertClasses} border-l-4 p-4 rounded flex items-start mb-4`}>
      <Icon className="flex-shrink-0 h-5 w-5 mt-0.5 mr-3" />
      <div>{message}</div>
    </div>
  );
};

export default Alert;