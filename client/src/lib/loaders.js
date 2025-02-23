// import { defer } from "react-router-dom";
// import apiRequest from "./apiRequest";

// export const singlePageLoader = async ({ request, params }) => {
//   const res = await apiRequest("/posts/" + params.id);
//   return res.data;
// };
// export const listPageLoader = async ({ request, params }) => {
//   const query = request.url.split("?")[1];
//   const postPromise = apiRequest("/posts?" + query);
//   return defer({
//     postResponse: postPromise,
//   });
// };

// export const profilePageLoader = async () => {
//   const postPromise = apiRequest("/users/profilePosts");
//   const chatPromise = apiRequest("/chats");
//   return defer({
//     postResponse: postPromise,
//     chatResponse: chatPromise,
//   });
// };


import apiRequest from "./apiRequest"; // Adjust the path as necessary

export const singlePageLoader = async ({ params }) => {
  const res = await apiRequest(`/posts/${params.id}`);
  return res.data;
};

export const listPageLoader = async ({ request }) => {
  try {
    // Get the query string from the URL
    const url = new URL(request.url);
    const queryString = url.search;

    console.log("Search parameters:", queryString);
    
    // Make the API request with the query parameters
    const postPromise = apiRequest(`/posts${queryString}`);
    
    return {
      postResponse: postPromise,
    };
  } catch (error) {
    console.error("Error in listPageLoader:", error);
    // Return empty data but don't break the loader
    return {
      postResponse: { data: [] },
    };
  }
};

export const profilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts");
  const chatPromise = apiRequest("/chats");
  return {
    postResponse: postPromise,
    chatResponse: chatPromise,
  };
};

export const chatPageLoader = async ({ params }) => {
  try {
    const res = await apiRequest(`/chats/${params.id}`);
    return res.data;
  } catch (error) {
    throw new Error("Could not load chat");
  }
};

export const postDetailsLoader = async () => {
  try {
    const res = await apiRequest("/posts/details");
    return res.data;
  } catch (error) {
    throw new Error("Could not load post details");
  }
};
