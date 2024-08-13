import { useEffect, useState } from "react";

const useNetworkSpeed = () => {
  const [networkStatus, setNetworkStatus] = useState(null);

  useEffect(() => {
    const updateNetworkStatus = () => {
      if (navigator.connection) {
        const { downlink, effectiveType } = navigator.connection;
        setNetworkStatus({ downlink, effectiveType });
      }
    };

    updateNetworkStatus();

    if (navigator.connection) {
      navigator.connection.addEventListener("change", updateNetworkStatus);
    }

    return () => {
      if (navigator.connection) {
        navigator.connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};

export default useNetworkSpeed;
