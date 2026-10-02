import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = [
  'src/components',
  'src/pages',
  'src/layouts',
  'src/context',
  'src/hooks'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const files = {
  'src/layouts/MainLayout.jsx': `import { Outlet } from 'react-router-dom';\nimport Navbar from '../components/Navbar';\n\nconst MainLayout = () => {\n  return (\n    <div className="min-h-screen bg-base-200">\n      <Navbar />\n      <main className="container mx-auto p-4">\n        <Outlet />\n      </main>\n    </div>\n  );\n};\nexport default MainLayout;`,
  'src/components/Navbar.jsx': `import { Link } from 'react-router-dom';\n\nconst Navbar = () => {\n  return (\n    <div className="navbar bg-base-100 shadow-sm">\n      <div className="flex-1">\n        <Link to="/" className="btn btn-ghost text-xl">ConnectHub</Link>\n      </div>\n      <div className="flex-none">\n        <ul className="menu menu-horizontal px-1">\n          <li><Link to="/login">Login</Link></li>\n          <li><Link to="/register">Register</Link></li>\n        </ul>\n      </div>\n    </div>\n  );\n};\nexport default Navbar;`,
  'src/pages/Home.jsx': `const Home = () => {\n  return (\n    <div>\n      <h1 className="text-3xl font-bold">Home Feed</h1>\n    </div>\n  );\n};\nexport default Home;`,
  'src/pages/Login.jsx': `const Login = () => {\n  return (\n    <div className="flex justify-center items-center h-full">\n      <div className="card w-96 bg-base-100 shadow-xl">\n        <div className="card-body">\n          <h2 className="card-title">Login</h2>\n          <p>Login form placeholder</p>\n        </div>\n      </div>\n    </div>\n  );\n};\nexport default Login;`,
  'src/pages/Register.jsx': `const Register = () => {\n  return (\n    <div className="flex justify-center items-center h-full">\n      <div className="card w-96 bg-base-100 shadow-xl">\n        <div className="card-body">\n          <h2 className="card-title">Register</h2>\n          <p>Register form placeholder</p>\n        </div>\n      </div>\n    </div>\n  );\n};\nexport default Register;`,
  'src/pages/Profile.jsx': `const Profile = () => {\n  return <div><h1 className="text-3xl font-bold">Profile</h1></div>;\n};\nexport default Profile;`,
  'src/pages/Dashboard.jsx': `const Dashboard = () => {\n  return <div><h1 className="text-3xl font-bold">Admin Dashboard</h1></div>;\n};\nexport default Dashboard;`
};

Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(path.join(__dirname, filePath), content);
});

console.log('Structure created');
