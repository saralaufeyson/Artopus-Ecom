import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-9xl font-extrabold text-logo-purple animate-bounce">404</h1>
      <div className="bg-logo-purple px-2 text-sm rounded rotate-12 absolute mb-24">
        Page Not Found
      </div>
      <div className="mt-8">
        <p className="text-2xl font-semibold md:text-3xl dark:text-white">Sorry, we couldn't find this page.</p>
        <p className="mt-4 mb-8 text-gray-500 dark:text-gray-400">But don't worry, you can find plenty of other things on our homepage.</p>
        <Link 
          to="/" 
          className="px-8 py-3 font-semibold rounded-lg bg-logo-purple text-white hover:bg-logo-purple/90 transition-all shadow-lg shadow-logo-purple/20"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
