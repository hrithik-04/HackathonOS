const originalFetch = window.fetch.bind(window);

window.fetch = async (input, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await originalFetch(input, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("newUserId");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return response;
  } catch (error) {
    console.error("Fetch interceptor error:", error);
    throw error;
  }
};