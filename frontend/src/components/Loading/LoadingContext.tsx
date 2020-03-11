import * as React from 'react';
import {createContext} from "react";

const LoadingContext = createContext<boolean>(false);

export default LoadingContext;