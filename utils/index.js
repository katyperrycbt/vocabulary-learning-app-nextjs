import { useEffect, useLayoutEffect, useState } from "react";
import Router from "next/router";
import { logout } from "@actions";
import * as t from "@consts";

export const isAuth = () => {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("vip-user")) {
      return JSON.parse(localStorage.getItem("vip-user"));
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const getJWT = () => {
  if (typeof window !== "undefined") {
    if (localStorage.getItem("vip-token")) {
      return JSON.parse(localStorage.getItem("vip-token"));
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const handleServerError = (error, noRedirect) => {
  if (!error)
    return { error: `Unknown error, please report this case to us! 😥` };
  if (`${error}` === "TypeError: Failed to fetch") {
    return {
      error: `Oops! Our server is currently unresponsive or under maintenance, please try again later!`,
    };
  } else if (`${error}` === "Error: Request failed with status code 401") {
    handleResponse({ status: 401 }, noRedirect);
    return { error: "Unauthorized, please login again!" };
  } else if (`${error}` === "Error: Request failed with status code 400") {
    return { error: error.response.data.error };
  } else if (`${error}` === "Error: Request failed with status code 500") {
    return { error: `Internal Server Error` };
  } else {
    return { error: `Internal Server Error` };
  }
};

export const handleResponse = (res, noRedirect) => {
  if (res.status === 401) {
    if (!noRedirect) {
      logout(() =>
        Router.push({
          pathname: "/login",
          query: {
            message: "Your session is expire. Please sign in!",
          },
        })
      );
    }
    return "true";
  } else {
    return;
  }
};

export const handleCommonResponse = (res, options = {}) => {
  if (!res) {
    return {};
  } else {
    const {
      onRedirect = () => {},
      onError = () => {},
      onSuccess = () => {},
    } = options;

    const isRedirect = handleResponse(res) === "true";
    if (isRedirect) {
      if (onRedirect) {
        onRedirect();
      }
      return {};
    } else {
      const data = res.data;

      if (data?.error) {
        if (onError) {
          onError(data.error);
        }
        return { error: data.error };
      }
      if (onSuccess) {
        onSuccess(data);
      }
      return data;
    }
  }
};

export const getRandomNumberInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getSizeImage = async (link, callback) => {
  const data = await toDataURL(link);
  return new Promise((resolve, reject) => {
    const newImg = new window.Image();
    newImg.src = data;
    newImg.onload = function () {
      if (callback) {
        callback({
          width: this.width,
          height: this.height,
        });
        resolve();
      }
    };
  });
};

export const toDataURL = async (url) => {
  return fetch(url)
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      return URL.createObjectURL(blob);
    });
};

export const validateEmail = (email) => {
  if (!email || email.length === 0) return false;
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validatePassword = (password) => {
  return String(password).match(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  );
};

export const isValidHttpUrl = (string, canBeEmtyOrNull = false) => {
  if (
    canBeEmtyOrNull &&
    (!string || string === "" || string === null || string === undefined)
  ) {
    return true;
  }

  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 50,
      height: 50,
    },
    children: `${name?.split(" ")?.[0]?.[0]}${name?.split(" ")?.[1]?.[0]}`,
  };
}

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export const convertString2Array = (str) =>
  str === "" ? [] : str.split(",").map((item) => item.trim());

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useThisToGetSizesFromRef(elRef, options = {}) {
  const [sizes, setSizes] = useState({ width: 0, height: 0 });
  const { revalidate, timeout } = options;

  useIsomorphicLayoutEffect(() => {
    function updateSize() {
      setSizes({
        width: elRef?.current?.clientWidth || 0,
        height: elRef?.current?.clientHeight || 0,
      });
    }

    window.addEventListener("resize", updateSize);

    let loop;

    if (revalidate && typeof revalidate === "number") {
      loop = setInterval(() => updateSize(), [revalidate]);
      if (timeout) {
        setTimeout(() => clearInterval(loop), timeout);
      }
    }

    updateSize();

    return () => {
      window && window.removeEventListener("resize", updateSize);
      if (loop) {
        clearInterval(loop);
      }
    };
  }, [elRef]);

  return sizes;
}

export function useThisToGetPositionFromRef(elRef, options = {}) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const { revalidate, timeout } = options;
  const [oldWidth, setOldWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    function updatePosition(bypass = false) {
      const { top, left, right, bottom, width, height, x, y } =
        elRef?.current?.getBoundingClientRect() || {};

      if (bypass || elRef?.current?.clientWidth !== oldWidth) {
        setPosition({ top, left, right, bottom, width, height, x, y });
        setOldWidth(elRef?.current?.clientWidth);
      }
    }

    window.addEventListener("resize", updatePosition);

    let loop;

    if (revalidate && typeof revalidate === "number") {
      loop = setInterval(() => updatePosition(true), [revalidate]);
      if (timeout) {
        setTimeout(() => clearInterval(loop), timeout);
      }
    }

    return () => {
      window && window.removeEventListener("resize", updatePosition);
      if (loop) {
        clearInterval(loop);
      }
    };
  }, [elRef]);

  return position;
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
  useLayoutEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

export function debounce(func, wait) {
  var lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime,
    lastInvokeTime = 0,
    trailing = true;

  if (typeof func != "function") {
    throw new TypeError("Error");
  }

  wait = Number(wait) || 0;

  function invokeFunc(time) {
    var args = lastArgs,
      thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime,
      timeWaiting = wait - timeSinceLastCall;

    return timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0
    );
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
      isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
