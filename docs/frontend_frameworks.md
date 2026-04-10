# Frontend Frameworks - IDB Training Platform

## Frontend Architecture

The application follows a component-based architecture using React.js.

- **UI Layer:** Built using Tailwind CSS for utility-first styling
- **State Management:** Zustand is used to manage authentication and global state
- **API Communication:** Axios is used to send HTTP requests to backend services
- **Routing:** React Router DOM is used for navigation and protected routes

## Project Structure


src/
 ├── components/     # Reusable UI components
 ├── pages/          # Page-level components
 ├── services/       # API calls using Axios
 ├── store/          # Zustand global state
 ├── routes/         # Routing configuration
 └── theme/          # Material UI theme settings


## Authentication Flow

1. User enters email and password in login page  
2. Frontend sends request using Axios  
3. Backend validates and returns JWT via HTTP-only cookie  
4. Zustand stores user authentication state  
5. Protected routes restrict access to authenticated users only

## API Communication

Axios is used for all API calls.

- Sends requests to backend endpoints
- Includes credentials for authentication
- Handles errors globally

## Libraries Summary

- **React.js:** Core frontend framework
- **Tailwind CSS:** Utility-first CSS framework for styling
- **React Router DOM:** Routing and navigation
- **Zustand:** Global state management
- **Axios:** HTTP requests
- **React Hook Form:** Form validation
- **Chart.js / react-chartjs-2:** Charts
- **Leaflet / react-leaflet:** Maps and spatial components
- **date-fns:** Date utilities
- **Lucide React:** Icons
- **jsPDF / xlsx:** Export reports (PDF/Excel)
- **TanStack Query:** Server state management