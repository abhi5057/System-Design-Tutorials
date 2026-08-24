
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';

/**
 * Main Application Component
 *
 * Composes the SearchForm (input) and SearchResults (output).
 * Note how they do not pass props to each other directly;
 * they communicate purely through the Redux store.
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">SkyBooker Pro</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:text-blue-200 transition-colors">Flights</a></li>
              <li><a href="#" className="hover:text-blue-200 transition-colors">Hotels</a></li>
              <li><a href="#" className="hover:text-blue-200 transition-colors">Cars</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <SearchForm />
        <SearchResults />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SkyBooker Pro. A highly testable demo application.
        </div>
      </footer>
    </div>
  );
}

export default App;
