import React from "react";

export const useServer = (endpoint) => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState();
  React.useEffect(
    () =>
      fetch(endpoint)
        .then((c) => c.json())
        .then((d) => setData(d))
        .then(() => setLoading(false)),
    [endpoint]
  );

  return { loading, data };
};

export const serverPost = (endpoint, postData) => {
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData || {}),
  }).then((c) => c.json());
};
