import HomePage from "./routes/homePage/homePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ListPage from "./routes/listPage/listPage";
import { Layout, RequireAuth } from "./routes/layout/layout";
import SinglePage from "./routes/singlePage/singlePage";
import ProfilePage from "./routes/profilePage/profilePage";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import NewPostPage from "./routes/newPostPage/newPostPage";
import ChatPage from "./routes/chatPage/chatPage";
import PostDetailsPage from "./routes/postDetailsPage/postDetailsPage";
import PropertyDetailPage from "./routes/propertyDetailPage/propertyDetailPage";
import AdminPage from "./routes/adminPage/adminPage";
import AboutPage from "./routes/aboutPage/aboutPage";
import SuccessfulBookingPage from "./routes/successfulBookingPage/SuccessfulBookingPage";
import { chatPageLoader, listPageLoader, postDetailsLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true, // This makes it the default child route for "/"
          element: <HomePage />,
        },
        {
          path: "list",
          element: <ListPage />,
          loader: listPageLoader,
        },
        {
          path: "postdetails",
          element: <PostDetailsPage />,
        },
        {
          path: "property-details/:id",
          element: <PropertyDetailPage />,
        },
        {
          path: ":id",
          element: <SinglePage />,
          loader: singlePageLoader,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "about",
          element: <AboutPage />,
        },
        {
          path: "admin",
          element: <AdminPage />,
        },
        {
          path: "booking-success",
          element: <SuccessfulBookingPage />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "profile",
          element: <ProfilePage />,
          loader: profilePageLoader,
        },
        {
          path: "profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "add",
          element: <NewPostPage />,
        },
        {
          path: "chat/:id",
          element: <ChatPage />,
          loader: chatPageLoader,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
