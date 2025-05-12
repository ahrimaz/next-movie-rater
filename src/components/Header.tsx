import Link from 'next/link';

type HeaderProps = {
  showAdminLink?: boolean;
};

const Header = ({ showAdminLink = true }: HeaderProps) => {
  return (
    <header className="pb-6 mb-8 border-b">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold hover:text-blue-600 transition">
          Movie Rater
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link 
            href="/movies" 
            className="hover:text-blue-600 transition"
          >
            All Movies
          </Link>
          
          {showAdminLink && (
            <Link 
              href="/admin" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 