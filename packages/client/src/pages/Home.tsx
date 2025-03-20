import React from 'react';
import { Navigate } from 'react-router-dom';

import { usePageTitle } from '../hooks';

function Home() {
  usePageTitle(process.env.APP_TITLE!);

  return <Navigate to='/collections' replace />;
}

export default Home;
