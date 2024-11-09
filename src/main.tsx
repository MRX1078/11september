import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider} from "react-router-dom";
import PersonPage from './components/PersonPage/PersonPage'
import AuthPage from './components/LoginPage/Login'
import { createContext } from 'react';
import Store from './store/store.ts';

const store = new Store();
export const Context = createContext({
    store,
})


const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/person",
    element: <PersonPage/>,
  },
  {
    path: "/hr",
    element: <AuthPage/>
  }
]);

createRoot(document.getElementById('root')!).render(
  <Context.Provider value={{store}}>
  <React.StrictMode>
  <ChakraProvider>
    <RouterProvider router={router} />
  </ChakraProvider>
</React.StrictMode>,
</Context.Provider>
)
