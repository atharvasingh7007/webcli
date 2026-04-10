# Command Outputs

## node bin/webcli.js search "react memory leaks" --read-top 3 --limit 3
```json
{
  "source": "search",
  "command": "search",
  "count": 3,
  "ok": true,
  "mode": "search+read",
  "engine": "ddg",
  "query": "react memory leaks",
  "results": [
    {
      "title": "How to Fix Memory Leaks in React Applications - freeCodeCamp.org",
      "url": "https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/",
      "snippet": "",
      "source": "duckduckgo",
      "rank": 1,
      "read": {
        "ok": true,
        "url": "https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/",
        "content": "Title: How to Fix Memory Leaks in React Applications\n\nURL Source: https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/\n\nPublished Time: 2025-09-24T19:17:26.321Z\n\nMarkdown Content:\n# How to Fix Memory Leaks in React Applications\n\n[![Image 1: freeCodeCamp.org](https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg)](https://www.freecodecamp.org/news/)\n\nMenu Menu\n*         \n*   [Forum](https://forum.freecodecamp.org/)\n*   [Curriculum](https://www.freecodecamp.org/learn)\n\n[Donate](https://www.freecodecamp.org/donate/)\n\n[Learn to code — free 3,000-hour curriculum](https://www.freecodecamp.org/)\n\n September 24, 2025 /[#React](https://www.freecodecamp.org/news/tag/reactjs/)\n# How to Fix Memory Leaks in React Applications\n\n![Image 2: Olaleye Blessing](https://cdn.hashnode.com/res/hashnode/image/upload/v1753864060636/3d9d1203-996c-4548-86e1-327000b5d875.jpeg?w=500&h=500&fit=crop&crop=entropy&auto=compress,format&format=webp)[Olaleye Blessing](https://www.freecodecamp.org/news/author/Jongbo/)\n\n![Image 3: How to Fix Memory Leaks in React Applications](https://cdn.hashnode.com/res/hashnode/image/upload/v1758741256644/817dba0f-bf49-424c-9b13-86bf81dc327f.png)\n\nHave you ever noticed your React application getting slower the longer you use it? This could be a result of memory leaks. Memory leaks are a common performance issue in React applications. They can slow down your application, crash your browser, and frustrate users.\n\nIn this tutorial, you’ll learn what causes memory leaks and how to fix them.\n\n## Table Of Contents\n\n*   [Prerequisites](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-prerequisites)\n\n*   [What Are Memory Leaks in React?](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-what-are-memory-leaks-in-react)\n\n*   [When Does A Component Unmount?](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-when-does-a-component-unmount)\n\n*   [Common Causes Of Memory Leaks And How To Fix Them](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-common-causes-of-memory-leaks-and-how-to-fix-them)\n\n    *   [Event Listeners](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-event-listeners)\n\n    *   [Timers](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-timers)\n\n    *   [Subscriptions](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-subscriptions)\n\n    *   [Async Operations](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-async-operations)\n\n*   [Conclusion](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/#heading-conclusion)\n\n## Prerequisites\n\nBefore you move on, make sure you have:\n\n*   Basic knowledge of JavaScript, React, and React hooks\n\n*   Understanding of event handling, timers, and asynchronous calls\n\n*   A React development setup.\n\nIf you don’t have a React development setup, you can head over to the [memory-leak repo](https://github.com/Olaleye-Blessing/freecodecamp-fix-memory-leak). Run the commands below to set it up:\n\n```bash\n# clone the repo\ngit clone <https://github.com/Olaleye-Blessing/freecodecamp-fix-memory-leak.git>\n\n# navigate to the folder\ncd freecodecamp-fix-memory-leak.git\n\n# install the packages\npnpm install\n\n# start development\npnpm dev\n```\n\n## What Are Memory Leaks in React?\n\nIn JavaScript, memory leaks happen when an application allocates memory but fails to release it. This occurs even after the memory is no longer needed.\n\nIn React, memory leaks happen when a component creates resources but does not remove them when it unmounts. These resources can be event listeners, timers, or subscriptions.\n\nAs a user stays longer in the application, these unreleased resources accumulate. This accumulation causes the application to consume more RAM. This will eventually lead to several problems:\n\n*   A slow application\n\n*   The browser crashing\n\n*   A poor user experience\n\nFor example, a component might create a “resize” event listener when it mounts, but forgets to remove it when it unmounts. This builds up memory as the user stays longer in the application and resizes the screen.\n\n## When Does A Component Unmount?\n\nA component unmounts when it no longer exists in the DOM. This can happen if:\n\n1.   A user navigates away from the page.\n\n```typescript\n<Routes>\n   <Route path=\"/posts\" element={<Posts />} />\n   <Route path=\"/dashboard\" element={<Dashboard />} />\n </Routes>\n```\n\nThe dashboard component will unmount immediately when a user navigates from `/dashboard` to any other route in the application.\n\n2.   A component is conditionally rendered.\n\n```typescript\nfunction App() {\n   const [show, setShow] = useState(true);\n\n   return <div>{show && <Component />}</div>;\n }\n```\n\n`<Component />` will unmount when `show` becomes false.\n\n3.   A component key changes.\n\n```typescript\nfunction App() {\n   const [key, setKey] = useState(Date.now());\n\n   return (\n     <>\n       <button onClick={() => setKey(Date.now())}>Change Key</button>\n       <Form key={key} />\n     </>\n   );\n }\n```\n\nThe `<Form />` component will unmount every time the key changes. Also note that a new `<Form />` component will mount each time the key changes.\n\n## Common Causes Of Memory Leaks And How To Fix Them\n\nAs said earlier, there will be a memory leak when resources are not removed after a component unmounts. React `useEffect` allows you to return a function that will be called when a component unmounts.\n\n```typescript\nuseEffect(() => {\n  return () => {\n    // code to remove resources\n  };\n}, []);\n```\n\nYou can clean any created resources in this returned function. We will go through how to clean up some of these resources.\n\n### Event Listeners\n\nEvent listeners persist if they are not removed after a component unmounts. Look at the code below:\n\n```typescript\nimport { useEffect, useState } from \"react\";\n\nconst EventListener = () => {\n  const [windowWidth, setWindowWidth] = useState(0);\n\n  useEffect(() => {\n    function handleResize() {\n      const width = window.innerWidth;\n      console.log(\"__ Resizing Event Listerner __\", width);\n      setWindowWidth(width);\n    }\n\n    window.addEventListener(\"resize\", handleResize);\n  }, []);\n\n  return <div>Width is: {windowWidth}</div>;\n};\n\nexport default EventListener;\n```\n\nWe do not remove the resize event listener on unmount, so every mount adds a new listener. This failure to clean up leads to a memory leak.\n\n![Image 4: GIF shows multiple 'resize' event listeners being created each time a component mounts.](https://cdn.hashnode.com/res/hashnode/image/upload/v1758149182882/58ddc026-d6b8-4120-9144-53b6d87fb63e.gif)\n\nAs shown in the GIF above, we log the width in the console every time we resize the window’s width. We still log the same information after component unmounts. Also, when we check the “Event Listeners” tab, the number of listeners keeps increasing by 2 instead of being just 1 each time we remount the component.\n\nWe see two listeners when the component mounts because React uses StrictMode in development. This helps to see side effects in the development mode. The same reason the listeners increase by 2 any time we mount the component.\n\nTo fix this memory leak, we need to remove the event listener in our cleanup function.\n\n```typescript\nuseEffect(() => {\n  // previous code\n\n  return () => {\n    window.removeEventListener(\"resize\", handleResize);\n  };\n}, []);\n```\n\nThe cleanup function runs when the component unmounts. This, in turn, removes our event listener and prevents a memory leak.\n\n![Image 5: GIF shows a 'resize' event listener that is removed when the component unmounts.](https://cdn.hashnode.com/res/hashnode/image/upload/v1758149497654/f95d75b4-f41f-4bb0-806b-546555be813a.gif)\n\nNotice this time, nothing is shown in the console when we hide the component. Also, the resize event listener was reduced to 0 when we hid (unmounted) the component, and increased to 1 when we showed (mounted) it.\n\n### Timers\n\nTimers like `setInterval` and `setTimeout` can also cause memory leaks if they are not cleared after the component unmounts. Look at this:\n\n```typescript\nconst Timers = () => {\n  const [countDown, setCountDown] = useState(0);\n\n  useEffect(() => {\n    setInterval(() => {\n      console.log(\"__ Set Interval __\");\n      setCountDown((prev) => prev + 1);\n    }, 1000);\n  }, []);\n\n  console.log({ countDown });\n\n  return <div>Countdown: {countDown}</div>;\n};\n```\n\nThe interval will continue to run even after React hides or unmounts the component.\n\nNote that, in React 18+, React ignores a state update when a component already unmounts.\n\n![Image 6: GIF shows a countdown timer component that continues to run and update state after it has been unmounted from the DOM.](https://cdn.hashnode.com/res/hashnode/image/upload/v1758149517577/34868e3e-e8f6-495a-a2f8-ef0e1e745051.gif)\n\nIn the GIF, we notice that the console stops showing \"__ Outside effect ” anytime we hide/unmount the component. But the string, \" Interval __”, shows every time.\n\nWe can fix this by using the cleanup function. All timers (`setInterval`, `setTimeout`) return a unique timer ID that we can use to clear the timer after the component unmounts.\n\n```typescript\nconst [countDown, setCountDown] = useState(0);\nuseEffect(() => {\n  const timer = setInterval(() => {\n    console.count(\"__ Interval __\");\n    setCountDown((prev) => prev + 1);\n  }, 1000);\n\n  return () => {\n    clearInterval(timer);\n  };\n}, []);\n```\n\nWe now save the ID of the timer and use this ID to clear the interval when the component unmounts. The same method applies to `setTimeout`; save the ID and clear it with `clearTimeout`.\n\n![Image 7: GIF shows a countdown timer component that stops running and updating state after it unmounts.](https://cdn.hashnode.com/res/hashnode/image/upload/v1758149580900/7c37c824-93db-4b73-8ff4-c45c6404bb65.gif)\n\n### Subscriptions\n\nWhen a component subscribes to external data, it’s always appropriate to unsubscribe after the component unmounts. Most data source returns a callback function to unsubscribe from such data. Take Firebase for an example:\n\n```typescript\nimport { collection, onSnapshot } from \"firebase/firestore\";\nimport { useEffect } from \"react\";\n\nconst Subscriptions = () => {\n  useEffect(() => {\n    const unsubscribe = onSnapshot(collection(db, \"cities\"), () => {\n        // Respond to data\n        // ...\n    });\n  }, [])\n\n    return <div>Subscriptions</div>;\n};\n\nexport default Subscriptions;\n```\n\nThe `onSnapshot` function from `firebase/firestore` gets real-time updates from our database. It returns a callback function that stops listening to the DB updates. If you fail to call this function, our app continues to listen to these updates even when it no longer needs them.\n\n```typescript\nuseEffect(() => {\n  const unsubscribe = onSnapshot(collection(db, \"cities\"), () => {\n    // Respond to data\n    // ...\n  });\n\n  return () => {\n    unsubscribe();\n  };\n}, []);\n```\n\nCalling `unsubscribe()` in the returned function means we are no longer interested in listening to the data updates.\n\n### Async Operations\n\nOne common mistake is not cancelling an API call when it’s no longer needed. It's a waste of resources to allow an API call to keep running when the component unmounts. This is because the browser continues to hold references in memory until the promise resolves. Look at this example:\n\n```typescript\nimport { useEffect, useState } from \"react\";\n\ninterface Post {\n  id: string;\n  title: string;\n  views: number;\n}\n\nconst ApiCall = () => {\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(\"\");\n  const [data, setData] = useState<Post[] | null>(null);\n\n  useEffect(() => {\n    const getTodos = async () => {\n      try {\n        setLoading(true);\n\n        console.time(\"POSTS\");\n        const req = await fetch(\"<http://localhost:3001/posts>\");\n        const res = await req.json();\n        console.timeLog(\"POSTS\");\n        setData(res.posts);\n      } catch (error) {\n        setError(\"Try again\");\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    getTodos();\n  }, []);\n\n  return (\n    <div style={{ marginTop: \"2rem\" }}>\n      <p>ApiCall Component</p>\n      {loading ? (\n        <p>Loading...</p>\n      ) : error ? (\n        <p>{error}</p>\n      ) : data ? (\n        <p>Views: {data[0].views}</p>\n      ) : null}\n    </div>\n  );\n};\n\nexport default ApiCall;\n```\n\nThis component fetches a list of posts from our server immediately it mounts. It changes the UI based on the state of the API call:\n\n*   It displays a loading text when you click the button.\n\n*   It shows an error if the API fails.\n\n*   It shows the data if the API succeeds.\n\nWe have a simple server that returns the list of posts. The problem with the server is that it takes three seconds for it to return the list of posts.\n\nWhat happens when a user comes to this page but decides to leave before three seconds? (We simulate leaving the page by clicking the Hide Component button.)\n\n![Image 8: GIF shows a component that continues with an API call after it unmounts.](https://cdn.hashnode.com/res/hashnode/image/upload/v1758149803784/bf5cf55f-75fe-472f-9a08-653c53bdafaa.gif)\n\nAs you can see, the browser still holds a reference to the request even though it’s no longer needed.\n\nA proper way to fix this is to cancel the request when the component unmounts. We can do this by using the [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController). We can use the `abort` method to cancel the request before it gets completed, thereby releasing memory.\n\n```typescript\nimport { useEffect, useState } from \"react\";\n\ninterface Post {\n  id: string;\n  title: string;\n  views: number;\n}\n\nconst ApiCall = () => {\n  // previous code\n\n  useEffect(() => {\n    const controller = new AbortController();\n\n    const getTodos = async () => {\n      try {\n        // previous code\n\n        const req = await fetch(\"<http://localhost:3001/posts>\", {\n          signal: controller.signal,\n        });\n\n        // previous code\n      } catch (error) {\n        if (error instanceof Error && error.name === \"AbortError\") {\n          console.log(\"Request was cancelled\");\n          return;\n        }\n\n        setError(\"Try again\");\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    getTodos();\n\n    return () => {\n      controller.abort();\n    };\n  }, []);\n\n  return (\n    <div style={{ marginTop: \"2rem\" }}>\n      <p>ApiCall Component</p>\n      {/* previous code */}\n    </div>\n  );\n};\n\nexport default ApiCall;\n```\n\nWe created a controller to track our API request when the component mounts. We then attach the controller to our API request. Our cleanup function cancels the request if the users leave the page within three seconds.\n\nWe can see the result of this in the GIF below:\n\n![Image 9: GIF shows an API call being cancelled after its component unmounts.](https://cdn.hashnode.com/res/hashnode/image/upload/v1758149811531/5497edbd-050c-4059-b088-239e8c5b65ef.gif)\n\nMost production React applications use external libraries to fetch APIs. For example, [react query](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation#using-fetch) allows us to cancel a processing promise:\n\n```typescript\nconst query = useQuery({\n  queryKey: [\"todos\"],\n  queryFn: async ({ signal }) => {\n    const todosResponse = await fetch(\"/todos\", { signal });\n    const todos = await todosResponse.json();\n\n    return todos;\n  },\n});\n```\n\n## Conclusion\n\nMemory leaks can significantly impact your React application's performance and user experience. You can prevent these issues by properly cleaning up resources when a component unmounts. In summary, always remember to:\n\n*   Remove event listeners with `removeEventListener`.\n\n*   Clear timers with `clearInterval` and `clearTimeout`.\n\n*   Unsubscribe from external data sources.\n\n*   Cancel API requests using `AbortController`.\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\nADVERTISEMENT\n\n* * *\n\n![Image 10: Olaleye Blessing](https://cdn.hashnode.com/res/hashnode/image/upload/v1753864060636/3d9d1203-996c-4548-86e1-327000b5d875.jpeg?w=500&h=500&fit=crop&crop=entropy&auto=compress,format&format=webp)[Olaleye Blessing](https://www.freecodecamp.org/news/author/Jongbo/)\nFrontend Developer | Open-source contributor | Experienced Backend Developer\n\n* * *\n\nIf you read this far, thank the author to show them you care. Say Thanks\n\nLearn to code for free. freeCodeCamp's open source curriculum has helped more than 40,000 people get jobs as developers. [Get started](https://www.freecodecamp.org/learn)\n\nADVERTISEMENT\n\nfreeCodeCamp is a donor-supported tax-exempt 501(c)(3) charity organization (United States Federal Tax Identification Number: 82-0779546)\n\nOur mission: to help people learn to code for free. We accomplish this by creating thousands of videos, articles, and interactive coding lessons - all freely available to the public.\n\nDonations to freeCodeCamp go toward our education initiatives, and help pay for servers, services, and staff.\n\nYou can [make a tax-deductible donation here](https://www.freecodecamp.org/donate/).\n\n## Trending Books and Handbooks\n\n*   [REST APIs](https://www.freecodecamp.org/news/build-consume-and-document-a-rest-api/)\n*   [Clean Code](https://www.freecodecamp.org/news/how-to-write-clean-code/)\n*   [TypeScript](https://www.freecodecamp.org/news/learn-typescript-with-react-handbook/)\n*   [JavaScript](https://www.freecodecamp.org/news/learn-javascript-for-beginners/)\n*   [AI Chatbots](https://www.freecodecamp.org/news/how-to-build-an-ai-chatbot-with-redis-python-and-gpt/)\n*   [Command Line](https://www.freecodecamp.org/news/command-line-for-beginners/)\n*   [GraphQL APIs](https://www.freecodecamp.org/news/building-consuming-and-documenting-a-graphql-api/)\n*   [CSS Transforms](https://www.freecodecamp.org/news/complete-guide-to-css-transform-functions-and-properties/)\n*   [Access Control](https://www.freecodecamp.org/news/how-to-build-scalable-access-control-for-your-web-app/)\n*   [REST API Design](https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/)\n*   [PHP](https://www.freecodecamp.org/news/the-php-handbook/)\n*   [Java](https://www.freecodecamp.org/news/the-java-handbook/)\n*   [Linux](https://www.freecodecamp.org/news/learn-linux-for-beginners-book-basic-to-advanced/)\n*   [React](https://www.freecodecamp.org/news/react-for-beginners-handbook/)\n*   [CI/CD](https://www.freecodecamp.org/news/learn-continuous-integration-delivery-and-deployment/)\n*   [Docker](https://www.freecodecamp.org/news/the-docker-handbook/)\n*   [Golang](https://www.freecodecamp.org/news/learn-golang-handbook/)\n*   [Python](https://www.freecodecamp.org/news/the-python-handbook/)\n*   [Node.js](https://www.freecodecamp.org/news/get-started-with-nodejs/)\n*   [Todo APIs](https://www.freecodecamp.org/news/build-crud-operations-with-dotnet-core-handbook/)\n*   [JavaScript Classes](https://www.freecodecamp.org/news/how-to-use-classes-in-javascript-handbook/)\n*   [Front-End Libraries](https://www.freecodecamp.org/news/front-end-javascript-development-react-angular-vue-compared/)\n*   [Express and Node.js](https://www.freecodecamp.org/news/the-express-handbook/)\n*   [Python Code Examples](https://www.freecodecamp.org/news/python-code-examples-sample-script-coding-tutorial-for-beginners/)\n*   [Clustering in Python](https://www.freecodecamp.org/news/clustering-in-python-a-machine-learning-handbook/)\n*   [Software Architecture](https://www.freecodecamp.org/news/an-introduction-to-software-architecture-patterns/)\n*   [Programming Fundamentals](https://www.freecodecamp.org/news/what-is-programming-tutorial-for-beginners/)\n*   [Coding Career Preparation](https://www.freecodecamp.org/news/learn-to-code-book/)\n*   [Full-Stack Developer Guide](https://www.freecodecamp.org/news/become-a-full-stack-developer-and-get-a-job/)\n*   [Python for JavaScript Devs](https://www.freecodecamp.org/news/learn-python-for-javascript-developers-handbook/)\n\n## Mobile App\n\n*   [![Image 11: Download on the App Store](https://cdn.freecodecamp.org/platform/universal/apple-store-badge.svg)](https://apps.apple.com/us/app/freecodecamp/id6446908151?itsct=apps_box_link&itscg=30200)\n*   [![Image 12: Get it on Google Play](https://cdn.freecodecamp.org/platform/universal/google-play-badge.svg)](https://play.google.com/store/apps/details?id=org.freecodecamp)\n\n## Our Charity\n\n[Publication powered by Hashnode](https://hashnode.com/)[About](https://www.freecodecamp.org/news/about/)[Alumni Network](https://www.linkedin.com/school/free-code-camp/people/)[Open Source](https://github.com/freeCodeCamp/)[Shop](https://www.freecodecamp.org/news/shop/)[Support](https://www.freecodecamp.org/news/support/)[Sponsors](https://www.freecodecamp.org/news/sponsors/)[Academic Honesty](https://www.freecodecamp.org/news/academic-honesty-policy/)[Code of Conduct](https://www.freecodecamp.org/news/code-of-conduct/)[Privacy Policy](https://www.freecodecamp.org/news/privacy-policy/)[Terms of Service](https://www.freecodecamp.org/news/terms-of-service/)[Copyright Policy](https://www.freecodecamp.org/news/copyright-policy/)\n",
        "provider": "jina",
        "fromCache": false,
        "error": null
      }
    },
    {
      "title": "How to identify and fix memory leaks in react - DEV Community",
      "url": "https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh",
      "snippet": "",
      "source": "duckduckgo",
      "rank": 2,
      "read": {
        "ok": true,
        "url": "https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh",
        "content": "Title: How to identify and fix memory leaks in react\n\nURL Source: https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh\n\nPublished Time: 2025-02-11T10:15:32Z\n\nMarkdown Content:\n# How to identify and fix memory leaks in react - DEV Community\n[Skip to content](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#main-content)\n\n[![Image 1: DEV Community](https://media2.dev.to/dynamic/image/quality=100/https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png)](https://dev.to/)\n\n[Powered by Algolia](https://www.algolia.com/developers/?utm_source=devto&utm_medium=referral)\n\n[Log in](https://dev.to/enter?signup_subforem=1)[Create account](https://dev.to/enter?signup_subforem=1&state=new-user)\n\n## DEV Community\n\n![Image 2](https://assets.dev.to/assets/heart-plus-active-9ea3b22f2bc311281db911d416166c5f430636e76b15cd5df6b3b841d830eefa.svg)4 Add reaction \n\n![Image 3](https://assets.dev.to/assets/sparkle-heart-5f9bee3767e18deb1bb725290cb151c25234768a0e9a2bd39370c382d02920cf.svg)3 Like ![Image 4](https://assets.dev.to/assets/multi-unicorn-b44d6f8c23cdd00964192bedc38af3e82463978aa611b4365bd33a0f1f4f3e97.svg)1 Unicorn ![Image 5](https://assets.dev.to/assets/exploding-head-daceb38d627e6ae9b730f36a1e390fca556a4289d5a41abb2c35068ad3e2c4b5.svg)0 Exploding Head ![Image 6](https://assets.dev.to/assets/raised-hands-74b2099fd66a39f2d7eed9305ee0f4553df0eb7b4f11b01b6b1b499973048fe5.svg)0 Raised Hands ![Image 7](https://assets.dev.to/assets/fire-f60e7a582391810302117f987b22a8ef04a2fe0df7e3258a5f49332df1cec71e.svg)0 Fire \n\n0 Jump to Comments 1 Save  Boost \n\nCopy link\n\nCopied to Clipboard\n\n[Share to X](https://twitter.com/intent/tweet?text=%22How%20to%20identify%20and%20fix%20memory%20leaks%20in%20react%22%20by%20Emmanuel%20Onyeyaforo%20%23DEVCommunity%20https%3A%2F%2Fdev.to%2Femmanuelo%2Fhow-to-identify-and-fix-memory-leaks-in-react-3bbh)[Share to LinkedIn](https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fdev.to%2Femmanuelo%2Fhow-to-identify-and-fix-memory-leaks-in-react-3bbh&title=How%20to%20identify%20and%20fix%20memory%20leaks%20in%20react&summary=Introduction%20%20%20Memory%20management%20is%20an%20important%20aspect%20of%20building%20performant%20applications%2C...&source=DEV%20Community)[Share to Facebook](https://www.facebook.com/sharer.php?u=https%3A%2F%2Fdev.to%2Femmanuelo%2Fhow-to-identify-and-fix-memory-leaks-in-react-3bbh)[Share to Mastodon](https://s2f.kytta.dev/?text=https%3A%2F%2Fdev.to%2Femmanuelo%2Fhow-to-identify-and-fix-memory-leaks-in-react-3bbh)\n\n[Share Post via...](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#)[Report Abuse](https://dev.to/report-abuse)\n\n[![Image 8: Cover image for How to identify and fix memory leaks in react](https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fuzlznxridu56etqfvmcg.png)](https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fuzlznxridu56etqfvmcg.png)\n\n[![Image 9: Emmanuel Onyeyaforo](https://media2.dev.to/dynamic/image/width=50,height=50,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1088387%2F172bf7ba-c73b-4948-b4e2-c7efb519255b.png)](https://dev.to/emmanuelo)\n\n[Emmanuel Onyeyaforo](https://dev.to/emmanuelo)\nPosted on Feb 11, 2025\n\n![Image 10](https://assets.dev.to/assets/sparkle-heart-5f9bee3767e18deb1bb725290cb151c25234768a0e9a2bd39370c382d02920cf.svg)3![Image 11](https://assets.dev.to/assets/multi-unicorn-b44d6f8c23cdd00964192bedc38af3e82463978aa611b4365bd33a0f1f4f3e97.svg)1![Image 12](https://assets.dev.to/assets/exploding-head-daceb38d627e6ae9b730f36a1e390fca556a4289d5a41abb2c35068ad3e2c4b5.svg)![Image 13](https://assets.dev.to/assets/raised-hands-74b2099fd66a39f2d7eed9305ee0f4553df0eb7b4f11b01b6b1b499973048fe5.svg)![Image 14](https://assets.dev.to/assets/fire-f60e7a582391810302117f987b22a8ef04a2fe0df7e3258a5f49332df1cec71e.svg)\n\n# How to identify and fix memory leaks in react\n\n[#react](https://dev.to/t/react)[#webdev](https://dev.to/t/webdev)[#productivity](https://dev.to/t/productivity)\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#introduction) Introduction\n\nMemory management is an important aspect of building performant applications, and in the context of [React](https://react.dev/), it can be easy to overlook. A common issue that developers face is memory leaks, which can lead to sluggish performance, crashes, or even full application breakdowns.\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#whats-a-memory-leak) What’s a Memory Leak?\n\nMemory leaks occur when a program retains memory that is no longer necessary for its operation, causing an accumulation of unused memory. Over time, this results in increased memory consumption, which can severely degrade performance. In [JavaScript](https://devdocs.io/javascript/) applications, this problem often manifests when references to objects or variables are retained unnecessarily, preventing them from being garbage collected.\n\nIn React, memory leaks typically happen when components are unmounted, but some of their resources like [event listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener), timers, or subscriptions remain active. As a result, these resources continue to hold onto memory, even though they are no longer needed.\n\n[![Image 15: Visual cues on how memory leaks occur](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F2oapj6m2b7595rbgw2no.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F2oapj6m2b7595rbgw2no.png)\n\nModern JavaScript engines use automatic garbage collection to reclaim memory from objects that are no longer in use. However, the garbage collector can only free memory that is unreachable. If objects are still referenced, such as when event listeners or timers remain active, the garbage collector will not release their memory, leading to a memory leak.\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#how-to-identify-memory-leaks) How to Identify Memory Leaks\n\nIdentifying memory leaks can be a bit of an uphill task. However, there are several signs we can always look out for:\n\n*   **Increasing Memory Consumption**: If you observe that your application's memory usage continues to rise over time without being reclaimed, it's a clear indicator of a memory leak.\n*   **Performance Degradation**: A growing memory footprint can lead to slower rendering, increased load times, and lagging interactions, particularly when rendering large lists or complex components.\n*   **Crashes or Freezes**: Severe memory leaks can cause the browser to freeze or crash. If your application frequently becomes unresponsive, it’s a good idea to investigate for potential leaks.\n\nIn the sample code snippet below, the React component subscribes to a [WebSocket](https://websockets.readthedocs.io/en/stable/) to receive real-time data updates. When we forget to clean up the WebSocket connection when the component unmounts, causing a memory leak.\n\n```\n// Example: WebSocket leak\nimport { useEffect, useState } from 'react';\n\nfunction DataComponent() {\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    const socket = new WebSocket('ws://clothes-api.com/data/all');\n\n    socket.onmessage = (event) => {\n      setData(JSON.parse(event.data));\n    };\n\n    // Here we were supposed to add a cleanup function for the WebSocket connection but we didn't\n  }, []);\n\n  return <div>Data: {data}</div>;\n}\n```\n\nThis memory leak can be detected by tracking the heap size in [DevTools](https://developer.chrome.com/docs/devtools) or using the [React Developer Tools](https://react.dev/learn/react-developer-tools) to see if the component is unmounted but still holding onto memory. On inspection of the error we get on the devTool, we see this error:\n\n[![Image 16: Memory Leak Warning](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Ffx6fbtqk1hq056e04zqd.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Ffx6fbtqk1hq056e04zqd.png)\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#tools-for-detecting-memory-leaks) Tools for Detecting Memory Leaks\n\n*   **Chrome DevTools**: Chrome's built-in DevTools offer a variety of features to detect memory leaks, including heap snapshots, memory graphs, and garbage collection tracking.\n\n*   **React Developer Tools**: This extension allows you to inspect the React component tree and monitor state changes. It helps you identify components that may not be properly cleaned up.\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#techniques-for-identifying-memory-leaks) Techniques for Identifying Memory Leaks\n\nThere are several techniques and third-party packages we can identify memory leaks. The most common techniques include:\n\n*   **Heap Snapshots**\n\nHeap snapshots allow you to capture the state of memory usage at a particular point in time, compare different snapshots, and track which objects are holding onto memory unnecessarily.\n\nTo capture a heap snapshot in Chrome DevTools:\n\n1.   Open Chrome DevTools.\n2.   Navigate to the \"Memory\" tab.\n3.   Select \"Heap snapshot\" and click \"Take snapshot.\"\n4.   Analyze the snapshot to detect objects that remain in memory between renders or after components are unmounted.\n\nIn the test conducted on a sample project, we observed significant memory spikes when the [`useEffect`](https://react.dev/reference/react/useEffect) cleanup function was omitted. The discrepancy between the shallow and retained sizes provides a clear indication of how unused memory persists in the heap.\n\nAs components unmount without proper cleanup, the retained size continues to grow, highlighting memory that remains tied to the component, even though it should have been released.\n\nGIF![Image 17: Heap Snapshot Test](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fe0e5nnmkk09twokdw29u.gif)\n\n*   **Performance Monitoring**\n\nWe can also use the Performance panel in Chrome DevTools to monitor your app’s performance over time. If you notice consistent increases in memory usage without a corresponding drop, your application is likely leaking memory.\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#common-causes-of-memory-leaks-and-prevention)**Common Causes of Memory Leaks and Prevention**\n\nSeveral factors could cause memory leaks. Here are some of the most common ones:\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#unmounted-components-and-stale-references) Unmounted Components and Stale References\n\nIf we add event listeners in a component and fail to remove them when the component is unmounted, those listeners will continue to exist and consume memory.\n\nLet's look at this snippet from our sample project, a component with an event listener that causes a memory leak when not cleaned up:\n\n```\nimport { useEffect } from 'react';\n\nconst UnmountedComponentExample = () => {\n  useEffect(() => {\n    const handleClick = () => {\n      console.log('Window clicked!');\n    };\n\n    // First, we we attach an event listener to the window\n    window.addEventListener('click', handleClick);\n\n    // No cleanup function (Memory leak occurs here)\n  }, []);\n\n  return <div>Click anywhere in the window</div>;\n};\n\nexport default UnmountedComponentExample;\n```\n\n**Fix:** We can fix this by making sure the event listener is removed when the component unmounts:\n\n```\nimport { useEffect } from 'react';\n\nconst CleanedUpComponentExample = () => {\n  useEffect(() => {\n    const handleClick = () => {\n      console.log('Window clicked!');\n    };\n\n    window.addEventListener('click', handleClick);\n\n    // Cleanup function to remove the listener on unmount\n    return () => {\n      window.removeEventListener('click', handleClick);\n    };\n  }, []);\n\n  return <div>Click anywhere in the window</div>;\n};\n\nexport default CleanedUpComponentExample;\n```\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#inefficient-use-of-state-and-props) Inefficient Use of State and Props\n\nHolding large amounts of data in state or props without careful management can cause memory leaks, especially when the component no longer needs that data but fails to release it.\n\nHere’s an example of inefficient state management where a growing array of images can cause memory to accumulate over time:\n\n```\nimport { useState, useEffect } from 'react';\n\nconst InefficientStateExample = () => {\n  const [images, setImages] = useState([]);\n\n  const addImage = (newImage) => {\n    setImages([...images, newImage]);\n  };\n\n  useEffect(() => {\n    // Simulating an image being added on every render\n    addImage('new-image.jpg');\n  }, [images]);\n\n  return (\n    <div>\n      <h2>Image Carousel</h2>\n      {images.map((image, index) => (\n        <img key={index} src={image} alt={`Image ${index}`} />\n      ))}\n    </div>\n  );\n};\n\nexport default InefficientStateExample;\n```\n\n**Fix:** Avoid unnecessary state updates and manage large states efficiently. For example, using a more appropriate data structure or limiting updates:\n\n```\nimport { useState, useEffect } from 'react';\n\nconst EfficientStateExample = () => {\n  const [images, setImages] = useState([]);\n\n  const addImage = (newImage) => {\n    // Only update state if the image is new\n    setImages((prevImages) => [...prevImages, newImage]);\n  };\n\n  useEffect(() => {\n    // Simulate image addition only once, avoiding infinite growth\n    if (images.length === 0) {\n      addImage('new-image.jpg');\n    }\n  }, [images]);\n\n  return (\n    <div>\n      <h2>Image Carousel</h2>\n      {images.map((image, index) => (\n        <img key={index} src={image} alt={`Image ${index}`} />\n      ))}\n    </div>\n  );\n};\n\nexport default EfficientStateExample;\n```\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#3-improper-handling-of-side-effects-in-raw-useeffect-endraw-)**3. Improper Handling of Side Effects in `useEffect`**\n\nThe `useEffect` hook is used to manage side effects like event listeners, data fetching, or subscriptions. If you don't clean up these side effects when the component unmounts, you can create memory leaks.\n\nHere’s an example of improper handling of side effects, such as establishing a WebSocket connection without closing it when the component unmounts:\n\n```\nimport { useEffect } from 'react';\n\nconst ImproperEffectHandlingExample = () => {\n  useEffect(() => {\n    const socket = new WebSocket('ws://example.com/socket');\n\n    socket.onopen = () => {\n      console.log('WebSocket connection opened');\n    };\n\n    socket.onmessage = (event) => {\n      console.log('Message received:', event.data);\n    };\n\n    // No cleanup function (Memory leak occurs here)\n  }, []);\n\n  return <div>WebSocket Example</div>;\n};\n\nexport default ImproperEffectHandlingExample;\n```\n\n**Fix:** Make sure to close the WebSocket connection when the component unmounts to avoid keeping it active unnecessarily:\n\n```\nimport { useEffect } from 'react';\n\nconst ProperEffectHandlingExample = () => {\n  useEffect(() => {\n    const socket = new WebSocket('ws://example.com/socket');\n\n    socket.onopen = () => {\n      console.log('WebSocket connection opened');\n    };\n\n    socket.onmessage = (event) => {\n      console.log('Message received:', event.data);\n    };\n\n    // Cleanup function to close WebSocket when the component unmounts\n      //This fixes the code snippet featured in #How to Identify Memory Leaks.\n    return () => {\n      socket.close();\n      console.log('WebSocket connection closed');\n    };\n  }, []);\n\n  return <div>WebSocket Example</div>;\n};\n\nexport default ProperEffectHandlingExample;\n```\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#other-methods-to-prevent-memory-leaks) Other Methods to Prevent Memory Leaks\n\nAway from the common ones, here are other ways to manage and prevent memory leaks:\n\n*   **Managing State and Lifecycle Properly**\n\nComponents that store large amounts of data should clean up their state when they are no longer needed. You can use the `useEffect` hook’s cleanup function to reset the state when the component is unmounted.\n\nIn this case below, when the component unmounts, the state is reset to an empty array, preventing the data from unnecessarily occupying memory.\n\n```\nimport React, { useState, useEffect } from 'react';\n\nconst DataFetchingComponent = () => {\n  const [data, setData] = useState([]);\n\n  useEffect(() => {\n    const fetchData = async () => {\n      const result = await fetch('https://mocky.io/data/all');\n      const json = await result.json();\n      setData(json);\n    };\n\n    fetchData();\n\n    return () => {\n      setData([]); // Clean up state when component unmounts\n    };\n  }, []);\n\n  return <div>{data.length > 0 ? \"Data loaded\" : \"Loading...\"}</div>;\n};\n```\n\n*   **Proper Cleanup of Event Listeners and Timers**\n\nAlways remember to remove event listeners and clear timers when they are no longer needed. In the code snippet below, we attach a scroll event listener and manage a timer. Without putting in this measure, we run into an infinite loop which in turn causes a memory leak.\n\n```\nuseEffect(() => {\n  const handleScroll = () => {\n    console.log('User is scrolling');\n  };\n\n  window.addEventListener('scroll', handleScroll);\n\n  const timerId = setTimeout(() => {\n    console.log('Timer finished');\n  }, 1000);\n\n  // Cleanup both the event listener and the timer\n  return () => {\n    window.removeEventListener('scroll', handleScroll);\n    clearTimeout(timerId);\n  };\n}, []);\n```\n\n```\nconst memoizedCallback = useCallback(() => {\n  performClearOperation();\n}, []);\n```\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#advanced-techniques-for-memory-management) Advanced Techniques for Memory Management\n\nIn addition to basic practices like cleaning up event listeners and timers, advanced techniques can significantly improve memory management and performance in React applications. Here are some strategies we can apply:\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#using-raw-useref-endraw-and-raw-usecallback-endraw-hooks-to-prevent-unnecessary-rerenders) Using `useRef` and `useCallback` Hooks to Prevent Unnecessary Re-renders\n\n*   [`useRef`](https://react.dev/reference/react/useRef) for Persistent References Without Re-renders\n\n`useRef` is a hook that allows you to store mutable values that persist across renders without triggering a re-render.\n\nIn the example below, the `timerRef` reference persists across renders, and the `clearInterval` method is called when the component unmounts, preventing a memory leak by cleaning up the timer.\n\nExample with `useRef`:\n\n```\nimport { useRef, useEffect } from 'react';\n\nfunction TimerComponent() {\n  const timerRef = useRef(null);\n\n  useEffect(() => {\n    timerRef.current = setInterval(() => {\n      console.log('Timer running');\n    }, 1000);\n\n    // We perform a cleanup function to avoid memory leaks\n    return () => {\n      clearInterval(timerRef.current);\n    };\n  }, []);\n\n  return <div>Check the console for timer logs.</div>;\n}\n```\n\n*   `useCallback` to Prevent Function Re-creations\n\n`useCallback` helps memoize functions, so they are only re-created when one of their dependencies changes. This reduces the chance of memory leaks by preventing functions from being unnecessarily re-created.\n\nIn the example below, without `useCallback`, every render of `GetCount` would result in a new `increment` function being passed to `CountComponent`, causing unnecessary re-renders.\n\nExample with `useCallback`:\n\n```\nimport { useState, useCallback } from 'react';\n\nfunction GetCount() {\n  const [count, setCount] = useState(0);\n\n  // Memoize the increment function so it's not recreated on each render\n  const increment = useCallback(() => {\n    setCount((prevCount) => prevCount + 1);\n  }, []);\n\n  return <CountComponent onClick={increment} />;\n}\n\nfunction CountComponent({ onClick }) {\n  return <button onClick={onClick}>Increment</button>;\n}\n```\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#-raw-usememo-endraw-to-optimize-performance-and-memory-usage)`useMemo` to Optimize Performance and Memory Usage\n\n[`useMemo`](https://react.dev/reference/react/useMemo) memoizes the result of a calculation and only recalculates it when one of its dependencies changes. This prevents React from recalculating the value on every render, which can lead to performance degradation and memory issues.\n\nIn the example below, `useMemo` ensures that `getTotalSumCalculation` is only recalculated when `num` changes. This optimization improves performance and prevents memory issues by avoiding unnecessary recalculations.\n\n```\nimport { useMemo } from 'react';\n\nfunction GetTotalSum({ num }) {\n  const getTotalSumCalculation = (n) => {\n    console.log('Calculating...');\n    return n * 1000;\n  };\n\n  // Memoize the result of the expensive calculation\n  const result = useMemo(() => getTotalSumCalculation(num), [num]);\n\n  return <div>Result: {result}</div>;\n}\n\nexport default GetTotalSum\n```\n\n### [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#creating-custom-hooks-to-handle-repetitive-cleanup-tasks) Creating Custom Hooks to Handle Repetitive Cleanup Tasks\n\nCustom hooks are particularly helpful when working with resources that need consistent cleanup, such as event listeners, timers, or WebSockets. If several components in our app use `setTimeout` or `setInterval`, creating a custom hook to handle these timers ensures consistent cleanup and reduces the risk of memory leaks:\n\n```\nimport { useEffect, useRef } from 'react';\n\nfunction useInterval(callback, delay) {\n  const savedCallback = useRef();\n\n  // Remember the latest callback\n  useEffect(() => {\n    savedCallback.current = callback;\n  }, [callback]);\n\n  useEffect(() => {\n    function tick() {\n      savedCallback.current();\n    }\n\n    if (delay !== null) {\n      const id = setInterval(tick, delay);\n      return () => clearInterval(id); // Cleanup on unmount\n    }\n  }, [delay]);\n}\n\n// Usage in a component\nfunction TimerComponent() {\n  useInterval(() => {\n    console.log('Interval tick');\n  }, 1000);\n\n  return <div>Check the console for interval ticks.</div>;\n}\n```\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#conclusion) Conclusion\n\nMemory leak detection and prevention are important in our day-to-day app development. By understanding these practices and leveraging modern tools, we can effectively identify and prevent memory leaks in your React applications, ensuring a smoother, more efficient user experience.\n\nFor more information, refer to the [React documentation](https://react.dev/reference/react-dom/components) and review other additional resources on [Stackoverflow](https://stackoverflow.com/questions/56423725/how-to-find-memory-leaks-in-an-app-written-in-react) with similar problems and opinions.\n\n[![Image 18: profile](https://media2.dev.to/dynamic/image/width=64,height=64,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Forganization%2Fprofile_image%2F140%2F9639a040-3c27-4b99-b65a-85e100016d3c.png) MongoDB](https://dev.to/mongodb)Promoted\n\n*   [What's a billboard?](https://dev.to/billboards)\n*   [Manage preferences](https://dev.to/settings/customization#sponsors)\n\n* * *\n\n*   [Report billboard](https://dev.to/report-abuse?billboard=241239)\n\n[![Image 19: Build gen AI apps that run anywhere with MongoDB Atlas](https://media2.dev.to/dynamic/image/width=775%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fi.imgur.com%2FCjuXF8e.png)](https://www.mongodb.com/cloud/atlas/lp/try3?utm_campaign=display_devto-broad_pl_flighted_atlas_tryatlaslp_prosp_gic-null_ww-all_dev_dv-all_eng_leadgen&utm_source=devto&utm_medium=display&utm_content=aipowered-v1&bb=241239)\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#build-gen-ai-apps-that-run-anywhere-with-mongodb-atlas)[Build gen AI apps that run anywhere with MongoDB Atlas](https://www.mongodb.com/cloud/atlas/lp/try3?utm_campaign=display_devto-broad_pl_flighted_atlas_tryatlaslp_prosp_gic-null_ww-all_dev_dv-all_eng_leadgen&utm_source=devto&utm_medium=display&utm_content=aipowered-v1&bb=241239)\n\nMongoDB Atlas bundles vector search and a flexible document model so developers can build, scale, and run gen AI apps without juggling multiple databases. From LLM to semantic search, Atlas streamlines AI architecture. Start free today.\n\n[Start Free](https://www.mongodb.com/cloud/atlas/lp/try3?utm_campaign=display_devto-broad_pl_flighted_atlas_tryatlaslp_prosp_gic-null_ww-all_dev_dv-all_eng_leadgen&utm_source=devto&utm_medium=display&utm_content=aipowered-v1&bb=241239)\n\n Read More \n\n## Top comments (0)\n\nSubscribe\n\n![Image 20: pic](https://media2.dev.to/dynamic/image/width=256,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png)\n\nPersonal Trusted User[Create template](https://dev.to/settings/response-templates)\nTemplates let you quickly answer FAQs or store snippets for re-use.\n\nSubmit Preview[Dismiss](https://dev.to/404.html)\n\n[Code of Conduct](https://dev.to/code-of-conduct)•[Report abuse](https://dev.to/report-abuse)\n\nAre you sure you want to hide this comment? It will become hidden in your post, but will still be visible via the comment's [permalink](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#).\n\n- [x] \nHide child comments as well\n\n \nConfirm\n\nFor further actions, you may consider blocking this person and/or [reporting abuse](https://dev.to/report-abuse)\n\n[![Image 21: profile](https://media2.dev.to/dynamic/image/width=64,height=64,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Forganization%2Fprofile_image%2F6839%2F3d85988f-d18e-4522-b261-f86613cd9b50.png) Sonar](https://dev.to/sonar)Promoted\n\n*   [What's a billboard?](https://dev.to/billboards)\n*   [Manage preferences](https://dev.to/settings/customization#sponsors)\n\n* * *\n\n*   [Report billboard](https://dev.to/report-abuse?billboard=259978)\n\n[![Image 22: State of Code Developer Survey report](https://media2.dev.to/dynamic/image/width=775%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fucarecdn.com%2F2f2ce9b0-68e0-48a1-bf3e-46c08831a9be%2F)](https://www.sonarsource.com/sem/the-state-of-code/developer-survey-report/?utm_medium=paid&utm_source=dev&utm_campaign=ss-state-of-code-developer-survey26&utm_content=report-devsurvey-banner-x-2&utm_term=ww-all-x&s_category=Paid&s_source=Paid+Social&s_origin=dev&bb=259978)\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#state-of-code-developer-survey-report)[State of Code Developer Survey report](https://www.sonarsource.com/sem/the-state-of-code/developer-survey-report/?utm_medium=paid&utm_source=dev&utm_campaign=ss-state-of-code-developer-survey26&utm_content=report-devsurvey-banner-x-2&utm_term=ww-all-x&s_category=Paid&s_source=Paid+Social&s_origin=dev&bb=259978)\n\nDid you know 96% of developers don't fully trust that AI-generated code is functionally correct, yet only 48% always check it before committing? Check out Sonar's new report on the real-world impact of AI on development teams.\n\n[Read the results](https://www.sonarsource.com/sem/the-state-of-code/developer-survey-report/?utm_medium=paid&utm_source=dev&utm_campaign=ss-state-of-code-developer-survey26&utm_content=report-devsurvey-banner-x-2&utm_term=ww-all-x&s_category=Paid&s_source=Paid+Social&s_origin=dev&bb=259978)\n\n[![Image 23](https://media2.dev.to/dynamic/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1088387%2F172bf7ba-c73b-4948-b4e2-c7efb519255b.png) Emmanuel Onyeyaforo](https://dev.to/emmanuelo)\n\nFollow\n\n I thrive on problem-solving, and creating user-friendly experiences \n\n*    Location   Port Harcourt, Nigeria  \n*    Education   University of Port Harcourt  \n*    Pronouns   Him/He  \n*    Work   Software Developer  \n*    Joined  May 24, 2023 \n\n### More from [Emmanuel Onyeyaforo](https://dev.to/emmanuelo)\n\n[Handling React OTP Input Auth Web | React Native using react-otp-kit package #npm#react#reactnative#otp](https://dev.to/emmanuelo/handling-react-otp-input-auth-web-react-native-using-react-otp-kit-package-jnb)[Guide to Setting Up Prettier, Airbnb ESLint, and Husky for Your Next Project #productivity#design#architecture#javascript](https://dev.to/emmanuelo/guide-to-setting-up-prettier-airbnb-eslint-and-husky-for-your-next-project-17ge)[Hosting a React/Vue Application on cPanel with GitHub Actions CI/CD #webdev#cicd#react#github](https://dev.to/emmanuelo/hosting-a-reactvue-application-on-cpanel-with-github-actions-cicd-4m79)\n\n[![Image 24: profile](https://media2.dev.to/dynamic/image/width=64,height=64,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Forganization%2Fprofile_image%2F140%2F9639a040-3c27-4b99-b65a-85e100016d3c.png) MongoDB](https://dev.to/mongodb)Promoted\n\n*   [What's a billboard?](https://dev.to/billboards)\n*   [Manage preferences](https://dev.to/settings/customization#sponsors)\n\n* * *\n\n*   [Report billboard](https://dev.to/report-abuse?billboard=238996)\n\n[![Image 25: Build seamlessly, securely, and flexibly with MongoDB Atlas. Try free.](https://media2.dev.to/dynamic/image/width=350%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fi.imgur.com%2FAFPJu0g.png)](https://www.mongodb.com/cloud/atlas/lp/try3?utm_campaign=display_devto-webdev_pl_flighted_atlas_tryatlaslp_prosp_gic-null_ww-all_dev_dv-all_eng_leadgen&utm_source=devto&utm_medium=display&utm_content=runappsanywhere-v1&bb=238996)\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#build-seamlessly-securely-and-flexibly-with-mongodb-atlas-try-free)[Build seamlessly, securely, and flexibly with MongoDB Atlas. Try free.](https://www.mongodb.com/cloud/atlas/lp/try3?utm_campaign=display_devto-webdev_pl_flighted_atlas_tryatlaslp_prosp_gic-null_ww-all_dev_dv-all_eng_leadgen&utm_source=devto&utm_medium=display&utm_content=runappsanywhere-v1&bb=238996)\n\nMongoDB Atlas lets you build and run modern apps in 125+ regions across AWS, Azure, and Google Cloud. Multi-cloud clusters distribute data seamlessly and auto-failover between providers for high availability and flexibility. Start free!\n\n[Learn More](https://www.mongodb.com/cloud/atlas/lp/try3?utm_campaign=display_devto-webdev_pl_flighted_atlas_tryatlaslp_prosp_gic-null_ww-all_dev_dv-all_eng_leadgen&utm_source=devto&utm_medium=display&utm_content=runappsanywhere-v1&bb=238996)\n\n👋 Kindness is contagious\n\n*   [What's a billboard?](https://dev.to/billboards)\n*   [Manage preferences](https://dev.to/settings/customization#sponsors)\n\n* * *\n\n*   [Report billboard](https://dev.to/report-abuse?billboard=239387)\n\nTake a moment to explore this thoughtful article, beloved by the supportive DEV Community. **Coders of every background** are invited to share and elevate our collective know-how.\n\nA heartfelt **\"thank you\"** can brighten someone's day—leave your appreciation below!\n\nOn DEV, **sharing knowledge smooths our journey** and tightens our community bonds. Enjoyed this? A quick thank you to the author is hugely appreciated.\n\n## [](https://dev.to/emmanuelo/how-to-identify-and-fix-memory-leaks-in-react-3bbh#-cta-httpsdevtoenterstatenewuser-)[Okay](https://dev.to/enter?state=new-user&bb=239387)\n\n💎 DEV Diamond Sponsors\n\nThank you to our Diamond Sponsors for supporting the DEV Community\n\n[![Image 26: Google AI - Official AI Model and Platform Partner](https://media2.dev.to/dynamic/image/width=880%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fxjlyhbdqehj3akhz166w.png)](https://aistudio.google.com/?utm_source=partner&utm_medium=partner&utm_campaign=FY25-Global-DEVpartnership-sponsorship-AIS&utm_content=-&utm_term=-&bb=146443)\nGoogle AI is the official AI Model and Platform Partner of DEV\n\n[![Image 27: Neon - Official Database Partner](https://media2.dev.to/dynamic/image/width=880%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fbnl88cil6afxzmgwrgtt.png)](https://neon.tech/?ref=devto&bb=146443)\nNeon is the official database partner of DEV\n\n[![Image 28: Algolia - Official Search Partner](https://media2.dev.to/dynamic/image/width=880%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fv30ephnolfvnlwgwm0yz.png)](https://www.algolia.com/developers/?utm_source=devto&utm_medium=referral&bb=146443)\nAlgolia is the official search partner of DEV\n\n[DEV Community](https://dev.to/) — A space to discuss and keep up software development and manage your software career\n\n*   [Home](https://dev.to/)\n*   [DEV++](https://dev.to/++)\n*   [Videos](https://dev.to/videos)\n*   [DEV Education Tracks](https://dev.to/deved)\n*   [DEV Challenges](https://dev.to/challenges)\n*   [DEV Help](https://dev.to/help)\n*   [Advertise on DEV](https://dev.to/advertise)\n*   [Organization Accounts](https://dev.to/organizations)\n*   [DEV Showcase](https://dev.to/showcase)\n*   [About](https://dev.to/about)\n*   [Contact](https://dev.to/contact)\n*   [Free Postgres Database](https://dev.to/free-postgres-database-tier)\n*   [Forem Shop](https://shop.forem.com/)\n*   [MLH](https://mlh.io/)\n\n*   [Code of Conduct](https://dev.to/code-of-conduct)\n*   [Privacy Policy](https://dev.to/privacy)\n*   [Terms of Use](https://dev.to/terms)\n\nBuilt on [Forem](https://www.forem.com/) — the [open source](https://dev.to/t/opensource) software that powers [DEV](https://dev.to/) and other inclusive communities.\n\nMade with love and [Ruby on Rails](https://dev.to/t/rails). DEV Community © 2016 - 2026.\n\n![Image 29: DEV Community](https://media2.dev.to/dynamic/image/width=190,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png)\n\nWe're a place where coders share, stay up-to-date and grow their careers.\n\n[Log in](https://dev.to/enter?signup_subforem=1)[Create account](https://dev.to/enter?signup_subforem=1&state=new-user)\n\n![Image 30](https://assets.dev.to/assets/sparkle-heart-5f9bee3767e18deb1bb725290cb151c25234768a0e9a2bd39370c382d02920cf.svg)![Image 31](https://assets.dev.to/assets/multi-unicorn-b44d6f8c23cdd00964192bedc38af3e82463978aa611b4365bd33a0f1f4f3e97.svg)![Image 32](https://assets.dev.to/assets/exploding-head-daceb38d627e6ae9b730f36a1e390fca556a4289d5a41abb2c35068ad3e2c4b5.svg)![Image 33](https://assets.dev.to/assets/raised-hands-74b2099fd66a39f2d7eed9305ee0f4553df0eb7b4f11b01b6b1b499973048fe5.svg)![Image 34](https://assets.dev.to/assets/fire-f60e7a582391810302117f987b22a8ef04a2fe0df7e3258a5f49332df1cec71e.svg)\n",
        "provider": "jina",
        "fromCache": false,
        "error": null
      }
    },
    {
      "title": "Understanding Memory Leaks in React: How to Find and Fix Them",
      "url": "https://medium.com/@ignatovich.dm/understanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be",
      "snippet": "",
      "source": "duckduckgo",
      "rank": 3,
      "read": {
        "ok": true,
        "url": "https://medium.com/@ignatovich.dm/understanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be",
        "content": "Title: Understanding Memory Leaks in React: How to Find and Fix Them\n\nURL Source: https://medium.com/@ignatovich.dm/understanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be\n\nPublished Time: 2024-12-16T12:24:39Z\n\nMarkdown Content:\n# Understanding Memory Leaks in React: How to Find and Fix Them | by Frontend Highlights | Medium\n\n[Sitemap](https://medium.com/sitemap/sitemap.xml)\n\n[Open in app](https://play.google.com/store/apps/details?id=com.medium.reader&referrer=utm_source%3DmobileNavBar&source=post_page---top_nav_layout_nav-----------------------------------------)\n\nSign up\n\n[Sign in](https://medium.com/m/signin?operation=login&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=post_page---top_nav_layout_nav-----------------------global_nav------------------)\n\n[](https://medium.com/?source=post_page---top_nav_layout_nav-----------------------------------------)\n\nGet app\n\n[Write](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2Fnew-story&source=---top_nav_layout_nav-----------------------new_post_topnav------------------)\n\n[Search](https://medium.com/search?source=post_page---top_nav_layout_nav-----------------------------------------)\n\nSign up\n\n[Sign in](https://medium.com/m/signin?operation=login&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=post_page---top_nav_layout_nav-----------------------global_nav------------------)\n\n![Image 1](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)\n\n# Understanding Memory Leaks in React: How to Find and Fix Them\n\n[![Image 2: Frontend Highlights](https://miro.medium.com/v2/resize:fill:32:32/1*ISIQMnQqz3UzRTGB0_d4jw.jpeg)](https://medium.com/@ignatovich.dm?source=post_page---byline--fc782cf182be---------------------------------------)\n\n[Frontend Highlights](https://medium.com/@ignatovich.dm?source=post_page---byline--fc782cf182be---------------------------------------)\n\nFollow\n\n5 min read\n\n·\n\nDec 16, 2024\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fvote%2Fp%2Ffc782cf182be&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&user=Frontend+Highlights&userId=e5942dcccaa3&source=---header_actions--fc782cf182be---------------------clap_footer------------------)\n\n3\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2Ffc782cf182be&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---header_actions--fc782cf182be---------------------bookmark_footer------------------)\n\nListen\n\nShare\n\nMemory leaks are a common issue in long-lived React applications. They can lead to performance degradation, unresponsiveness, and eventual crashes. Identifying and resolving these leaks ensures your React app remains efficient and reliable, especially when handling dynamic data, complex components, or heavy user interactions.\n\n## What Causes Memory Leaks in React?\n\nMemory leaks in React applications often occur due to improperly managed resources that aren’t released when components unmount or change. Some common culprits include:\n\n1.   **Subscriptions or Event Listeners**: Forgetting to unsubscribe from event listeners (e.g., `window.addEventListener`) when a component unmounts.\n2.   **Timers and Intervals**: Neglecting to clear `setTimeout` or `setInterval`.\n3.   **Aborted API Calls**: Not canceling ongoing API requests when a component unmounts.\n4.   **Closures in**`useEffect`: Stale closures inside `useEffect` hooks can hold references to outdated variables or states.\n5.   **Global References**: Keeping references in global objects or contexts that aren’t cleaned up.\n\n## How to Detect Memory Leaks\n\n### 1. Using Chrome DevTools\n\n**Heap Snapshots**:\n\n*   Open Chrome DevTools, go to the **“Memory”** tab, and take a **Heap Snapshot** before and after interactions in your app.\n*   Look for “Detached DOM nodes” or objects that shouldn’t persist.\n\n**Timeline Analysis**:\n\n*   Use the **Performance** tab to monitor memory usage over time. A steady increase without stabilization indicates a memory leak.\n\n### 2. Profiling with React Developer Tools\n\n*   Identify unnecessary re-renders and large component trees that may contribute to memory retention.\n\n### 3. External Tools\n\n**why-did-you-render**:\n\n*   Tracks unnecessary renders that may indirectly cause memory issues.\n\n**LeakCanary** (for mobile): Helps monitor memory allocations in React Native apps.\n\n## Fixing Memory Leaks: Examples\n\n### 1. Cleaning Up Event Listeners\n\n**Problem**: A component adds an event listener but doesn’t remove it on unmount, causing the callback to persist in memory.\n\nBefore:\n\nuseEffect(() => {\n\n const onResize = () => console.log('Window resized');\n\n window.addEventListener('resize', onResize);\n\n // Missing cleanup\n\n}, []);\nAfter:\n\nuseEffect(() => {\n\n const onResize = () => console.log('Window resized');\n\n window.addEventListener('resize', onResize);\n\n return () => {\n\n window.removeEventListener('resize', onResize); // Cleanup\n\n };\n\n}, []);\n### 2. Clearing Timers and Intervals\n\n**Problem**: A `setInterval` continues to run even after the component unmounts.\n\nBefore:\n\nuseEffect(() => {\n\n const intervalId = setInterval(() => {\n\n console.log('Interval running');\n\n }, 1000);\n\n // Missing cleanup\n\n}, []);\nAfter:\n\nuseEffect(() => {\n\n const intervalId = setInterval(() => {\n\n console.log('Interval running');\n\n }, 1000);\n\n return () => {\n\n clearInterval(intervalId); // Cleanup\n\n };\n\n}, []);\n### 3. Aborting API Calls\n\n**Problem**: A component unmounts while an API call is still in progress, leading to errors or leaks.\n\nBefore:\n\nuseEffect(() => {\n\n fetch('/api/data')\n\n .then((response) => response.json())\n\n .then((data) => console.log(data));\n\n // No way to abort\n\n}, []);\nAfter:\n\nuseEffect(() => {\n\n const controller = new AbortController();\n\n fetch('/api/data', { signal: controller.signal })\n\n .then((response) => response.json())\n\n .then((data) => console.log(data))\n\n .catch((error) => {\n\n if (error.name === 'AbortError') {\n\n console.log('Fetch aborted');\n\n }\n\n });\n\n return () => {\n\n controller.abort(); // Abort the API call\n\n };\n\n}, []);\n### 4. Preventing Stale Closures in `useEffect`\n\n**Problem**: A closure inside `useEffect` captures outdated state, holding unnecessary references in memory.\n\n## Get Frontend Highlights’s stories in your inbox\n\nJoin Medium for free to get updates from this writer.\n\nSubscribe\n\nSubscribe\n\n- [x] \n\nRemember me for faster sign in\n\n \n\nBefore:\n\nconst [count, setCount] = useState(0);\n\nuseEffect(() => {\n\n const id = setInterval(() => {\n\n console.log(count); // Stale reference\n\n }, 1000);\n\n return () => clearInterval(id);\n\n}, []);\nAfter:\n\nconst [count, setCount] = useState(0);\n\nuseEffect(() => {\n\n const id = setInterval(() => {\n\n setCount((prevCount) => prevCount + 1); // Use functional update\n\n }, 1000);\n\n return () => clearInterval(id);\n\n}, []);\n## Best Practices to Avoid Memory Leaks\n\n1.   **Always Clean Up Resources**: Use the cleanup function inside `useEffect` for event listeners, timers, and API calls.\n2.   **Avoid Global Variables**: Scope variables to the component or context where they are needed.\n3.   **Limit Component Lifespan**: Keep components small and focused, reducing their likelihood of persisting in memory unnecessarily.\n4.   **Use Tools**: Rely on tools like `why-did-you-render` to monitor unwanted re-renders.\n5.   **Audit Third-Party Libraries**: Ensure libraries like modals, carousels, or analytics tools don’t introduce memory leaks.\n\n## Using `useMemo` to Prevent Memory Leaks\n\nReact’s `useMemo` helps optimize rendering by memoizing computed values. While primarily a performance tool, improper usage can lead to memory issues by holding references unnecessarily. Here's how `useMemo` helps and how to avoid pitfalls.\n\n### How `useMemo` Helps\n\n`useMemo` ensures that heavy computations or expensive objects aren't recalculated unnecessarily. It caches the result of a computation and recalculates it only when dependencies change. This is especially useful in:\n\n*   Preventing unnecessary re-renders in child components.\n*   Optimizing derived state or calculations.\n*   Avoiding memory overuse when dealing with large datasets.\n\n### Example 1: Optimizing Derived State\n\nBefore (Without `useMemo`):\n\nconst Component = ({ items }) => {\n\n const expensiveCalculation = items.filter(item => item.value > 10).length;\n\n return <p>Total items: {expensiveCalculation}</p>;\n\n};\nAfter:\n\nconst Component = ({ items }) => {\n\n const expensiveCalculation = useMemo(() => {\n\n return items.filter(item => item.value > 10).length;\n\n }, [items]);\n\n return <p>Total items: {expensiveCalculation}</p>;\n\n};\nBy caching the computation, the function executes only when `items` changes, saving CPU and memory.\n\n### Example 2: Avoiding Memory Leaks with Dependent Functions\n\nBefore:\n\nconst Component = ({ multiplier }) => {\n\n const handleClick = () => {\n\n console.log(multiplier * 10);\n\n };\n\n useEffect(() => {\n\n window.addEventListener('click', handleClick);\n\n return () => {\n\n window.removeEventListener('click', handleClick);\n\n };\n\n }, [multiplier]); // Stale closure risk!\n\n};\nIf `multiplier` changes frequently, this can cause stale closures, holding unnecessary memory references.\n\nAfter:\n\nconst Component = ({ multiplier }) => {\n\n const handleClick = useMemo(() => {\n\n return () => console.log(multiplier * 10);\n\n }, [multiplier]);\n\n useEffect(() => {\n\n window.addEventListener('click', handleClick);\n\n return () => {\n\n window.removeEventListener('click', handleClick);\n\n };\n\n }, [handleClick]);\n\n};\nBy wrapping the callback in `useMemo`, you ensure the function doesn’t cause memory bloat or stale closures.\n\n### Real-World Scenario: Optimizing Component with Large Datasets\n\nBefore:\n\nconst LargeTable = ({ data }) => {\n\n const processedData = data.map(item => ({ ...item, extraField: item.value * 2 }));\n\n return (\n\n <div>\n\n {processedData.map((row, index) => (\n\n <div key={index}>{row.extraField}</div>\n\n ))}\n\n </div>\n\n );\n\n};\nWhen dealing with large datasets, reprocessing data on every render consumes memory unnecessarily.\n\nconst LargeTable = ({ data }) => {\n\n const processedData = useMemo(() => {\n\n return data.map(item => ({ ...item, extraField: item.value * 2 }));\n\n }, [data]);\n\n return (\n\n <div>\n\n {processedData.map((row, index) => (\n\n <div key={index}>{row.extraField}</div>\n\n ))}\n\n </div>\n\n );\n\n};\nUsing `useMemo`, `processedData` is recalculated only when `data` changes.\n\n### Best Practices for Using `useMemo`\n\n1.   **Target Expensive Calculations**: Avoid overusing `useMemo` for trivial operations; focus on CPU-intensive tasks or large objects.\n2.   **Prune Dependencies**: Ensure dependency arrays are accurate to prevent unexpected recalculations.\n3.   **Don’t Over-optimize**: Using `useMemo` unnecessarily adds complexity without significant performance benefits.\n\n## Conclusion\n\nMemory leaks in React can sneak into applications due to improper cleanup of resources. By understanding common causes and employing tools like Chrome DevTools and React Profiler, you can efficiently diagnose and resolve issues.\n\n[Support me with a coffee :)](https://buymeacoffee.com/guestdm)\n\n[React](https://medium.com/tag/react?source=post_page-----fc782cf182be---------------------------------------)\n\n[React Optimization](https://medium.com/tag/react-optimization?source=post_page-----fc782cf182be---------------------------------------)\n\n[React Js Tutorials](https://medium.com/tag/react-js-tutorials?source=post_page-----fc782cf182be---------------------------------------)\n\n[Memory Leak React](https://medium.com/tag/memory-leak-react?source=post_page-----fc782cf182be---------------------------------------)\n\n[Memory Leak](https://medium.com/tag/memory-leak?source=post_page-----fc782cf182be---------------------------------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fvote%2Fp%2Ffc782cf182be&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&user=Frontend+Highlights&userId=e5942dcccaa3&source=---footer_actions--fc782cf182be---------------------clap_footer------------------)\n\n3\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fvote%2Fp%2Ffc782cf182be&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&user=Frontend+Highlights&userId=e5942dcccaa3&source=---footer_actions--fc782cf182be---------------------clap_footer------------------)\n\n3\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2Ffc782cf182be&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---footer_actions--fc782cf182be---------------------bookmark_footer------------------)\n\n[![Image 3: Frontend Highlights](https://miro.medium.com/v2/resize:fill:48:48/1*ISIQMnQqz3UzRTGB0_d4jw.jpeg)](https://medium.com/@ignatovich.dm?source=post_page---post_author_info--fc782cf182be---------------------------------------)\n\n[![Image 4: Frontend Highlights](https://miro.medium.com/v2/resize:fill:64:64/1*ISIQMnQqz3UzRTGB0_d4jw.jpeg)](https://medium.com/@ignatovich.dm?source=post_page---post_author_info--fc782cf182be---------------------------------------)\n\nFollow\n\n[## Written by Frontend Highlights](https://medium.com/@ignatovich.dm?source=post_page---post_author_info--fc782cf182be---------------------------------------)\n\n[4.5K followers](https://medium.com/@ignatovich.dm/followers?source=post_page---post_author_info--fc782cf182be---------------------------------------)\n\n·[7 following](https://medium.com/@ignatovich.dm/following?source=post_page---post_author_info--fc782cf182be---------------------------------------)\n\nThis page is about simple frontend things which can be useful in real work Support us on [buymeacoffee.com/yourMarketBuddy](http://buymeacoffee.com/yourMarketBuddy) or [https://ko-fi.com/dm110416](https://ko-fi.com/dm110416)\n\nFollow\n\n## No responses yet\n\n[](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page---post_responses--fc782cf182be---------------------------------------)\n\n![Image 5](https://miro.medium.com/v2/resize:fill:32:32/1*dmbNkD5D-u45r44go_cf0g.png)\n\nWrite a response\n\n[What are your thoughts?](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---post_responses--fc782cf182be---------------------respond_sidebar------------------)\n\nCancel\n\nRespond\n\n## More from Frontend Highlights\n\n![Image 6: The JavaScript Event Loop Explained with Examples](https://miro.medium.com/v2/resize:fit:679/format:webp/0*vVsia7i4DvG_uGik.png)\n\n[![Image 7: Frontend Highlights](https://miro.medium.com/v2/resize:fill:20:20/1*ISIQMnQqz3UzRTGB0_d4jw.jpeg)](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----0---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[Frontend Highlights](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----0---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[## The JavaScript Event Loop Explained with Examples ### The event loop is a core concept in JavaScript that enables non-blocking, asynchronous behavior. Understanding how the event loop works is…](https://medium.com/@ignatovich.dm/the-javascript-event-loop-explained-with-examples-d8f7ddf0861d?source=post_page---author_recirc--fc782cf182be----0---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\nDec 16, 2024\n\n[18](https://medium.com/@ignatovich.dm/the-javascript-event-loop-explained-with-examples-d8f7ddf0861d?source=post_page---author_recirc--fc782cf182be----0---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---author_recirc--fc782cf182be----0-----------------explicit_signal----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2Fd8f7ddf0861d&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Fthe-javascript-event-loop-explained-with-examples-d8f7ddf0861d&source=---author_recirc--fc782cf182be----0-----------------bookmark_preview----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n![Image 8: 48 React interview questions with answers](https://miro.medium.com/v2/resize:fit:679/format:webp/110c09ba4444e338d29ed74adb04b0bf053357845c57c64219ba0655d653a4cd)\n\n[![Image 9: Frontend Highlights](https://miro.medium.com/v2/resize:fill:20:20/1*ISIQMnQqz3UzRTGB0_d4jw.jpeg)](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----1---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[Frontend Highlights](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----1---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[## 48 React interview questions with answers ### What is React? Why is it used?](https://medium.com/@ignatovich.dm/48-react-interview-questions-with-answers-084cb8ce706d?source=post_page---author_recirc--fc782cf182be----1---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\nOct 20, 2024\n\n[](https://medium.com/@ignatovich.dm/48-react-interview-questions-with-answers-084cb8ce706d?source=post_page---author_recirc--fc782cf182be----1---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---author_recirc--fc782cf182be----1-----------------explicit_signal----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F084cb8ce706d&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2F48-react-interview-questions-with-answers-084cb8ce706d&source=---author_recirc--fc782cf182be----1-----------------bookmark_preview----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n![Image 10: TanStack Query: A Powerful Tool for Data Management in React](https://miro.medium.com/v2/resize:fit:679/format:webp/1*lZyVk80SkDkDQ7U5F20FrA.png)\n\n[![Image 11: Frontend Highlights](https://miro.medium.com/v2/resize:fill:20:20/1*ISIQMnQqz3UzRTGB0_d4jw.jpeg)](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----2---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[Frontend Highlights](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----2---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[## TanStack Query: A Powerful Tool for Data Management in React ### TanStack Query is a library for managing server state in React applications, enabling efficient handling of asynchronous data like API…](https://medium.com/@ignatovich.dm/tanstack-query-a-powerful-tool-for-data-management-in-react-0c5ae6ef037c?source=post_page---author_recirc--fc782cf182be----2---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\nJan 23, 2025\n\n[1](https://medium.com/@ignatovich.dm/tanstack-query-a-powerful-tool-for-data-management-in-react-0c5ae6ef037c?source=post_page---author_recirc--fc782cf182be----2---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---author_recirc--fc782cf182be----2-----------------explicit_signal----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F0c5ae6ef037c&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Ftanstack-query-a-powerful-tool-for-data-management-in-react-0c5ae6ef037c&source=---author_recirc--fc782cf182be----2-----------------bookmark_preview----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n![Image 12: Express.js vs Fastify: Comparison for Building Node.js Applications](https://miro.medium.com/v2/resize:fit:679/format:webp/0*I77tBdo1yhVWlc6D)\n\n[![Image 13: Frontend Highlights](https://miro.medium.com/v2/resize:fill:20:20/1*ISIQMnQqz3UzRTGB0_d4jw.jpeg)](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----3---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[Frontend Highlights](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be----3---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[## Express.js vs Fastify: Comparison for Building Node.js Applications ### When it comes to building fast, efficient, and scalable backend applications in Node.js, Express.js and Fastify are two of the most popular…](https://medium.com/@ignatovich.dm/express-js-vs-fastify-comparison-for-building-node-js-applications-0a6c8aca0136?source=post_page---author_recirc--fc782cf182be----3---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\nOct 31, 2024\n\n[3](https://medium.com/@ignatovich.dm/express-js-vs-fastify-comparison-for-building-node-js-applications-0a6c8aca0136?source=post_page---author_recirc--fc782cf182be----3---------------------eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---author_recirc--fc782cf182be----3-----------------explicit_signal----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F0a6c8aca0136&operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Fexpress-js-vs-fastify-comparison-for-building-node-js-applications-0a6c8aca0136&source=---author_recirc--fc782cf182be----3-----------------bookmark_preview----eda13a7f_f6bd_48a3_abde_a0ab944fac58--------------)\n\n[See all from Frontend Highlights](https://medium.com/@ignatovich.dm?source=post_page---author_recirc--fc782cf182be---------------------------------------)\n\n## Recommended from Medium\n\n![Image 14: Stop Memorizing Design Patterns: Use This Decision Tree Instead](https://miro.medium.com/v2/resize:fit:679/format:webp/1*xfboC-sVIT2hzWkgQZT_7w.png)\n\n[![Image 15: Women in Technology](https://miro.medium.com/v2/resize:fill:20:20/1*kd0DvPkLdn59Emtg_rnsqg.png)](https://medium.com/womenintechnology?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nIn\n\n[Women in Technology](https://medium.com/womenintechnology?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nby\n\n[Alina Kovtun✨](https://medium.com/@akovtun?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[## Stop Memorizing Design Patterns: Use This Decision Tree Instead ### Choose design patterns based on pain points: apply the right pattern with minimal over-engineering in any OO language.](https://medium.com/womenintechnology/stop-memorizing-design-patterns-use-this-decision-tree-instead-e84f22fca9fa?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nJan 29\n\n[74](https://medium.com/womenintechnology/stop-memorizing-design-patterns-use-this-decision-tree-instead-e84f22fca9fa?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---read_next_recirc--fc782cf182be----0-----------------explicit_signal----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2Fe84f22fca9fa&operation=register&redirect=https%3A%2F%2Fmedium.com%2Fwomenintechnology%2Fstop-memorizing-design-patterns-use-this-decision-tree-instead-e84f22fca9fa&source=---read_next_recirc--fc782cf182be----0-----------------bookmark_preview----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n![Image 16: I Stopped Using ChatGPT for 30 Days. What Happened to My Brain Was Terrifying.](https://miro.medium.com/v2/resize:fit:679/format:webp/1*z4UOJs0b33M4UJXq5MXkww.png)\n\n[![Image 17: Level Up Coding](https://miro.medium.com/v2/resize:fill:20:20/1*5D9oYBd58pyjMkV_5-zXXQ.jpeg)](https://medium.com/gitconnected?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nIn\n\n[Level Up Coding](https://medium.com/gitconnected?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nby\n\n[Kusireddy](https://medium.com/@kusireddy?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[## I Stopped Using ChatGPT for 30 Days. What Happened to My Brain Was Terrifying. ### 91% of you will abandon 2026 resolutions by January 10th. Here’s how to be in the 9% who actually win.](https://medium.com/gitconnected/i-stopped-using-chatgpt-for-30-days-what-happened-to-my-brain-was-terrifying-70d2a62246c0?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nDec 28, 2025\n\n[489](https://medium.com/gitconnected/i-stopped-using-chatgpt-for-30-days-what-happened-to-my-brain-was-terrifying-70d2a62246c0?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---read_next_recirc--fc782cf182be----1-----------------explicit_signal----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F70d2a62246c0&operation=register&redirect=https%3A%2F%2Flevelup.gitconnected.com%2Fi-stopped-using-chatgpt-for-30-days-what-happened-to-my-brain-was-terrifying-70d2a62246c0&source=---read_next_recirc--fc782cf182be----1-----------------bookmark_preview----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n![Image 18: An example of a perfect, human designed dashboard interface for desktop and mobile phone](https://miro.medium.com/v2/resize:fit:679/format:webp/1*C8RVDKs_uZrVUdgpsF6Fmw.png)\n\n[![Image 19: Michal Malewicz](https://miro.medium.com/v2/resize:fill:20:20/1*149zXrb2FXvS_mctL4NKSg.png)](https://medium.com/@michalmalewicz?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[Michal Malewicz](https://medium.com/@michalmalewicz?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[## The End of Dashboards and Design Systems ### Design is becoming quietly human again.](https://medium.com/@michalmalewicz/the-end-of-dashboards-and-design-systems-5d98ec9de627?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nNov 26, 2025\n\n[282](https://medium.com/@michalmalewicz/the-end-of-dashboards-and-design-systems-5d98ec9de627?source=post_page---read_next_recirc--fc782cf182be----0---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---read_next_recirc--fc782cf182be----0-----------------explicit_signal----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F5d98ec9de627&operation=register&redirect=https%3A%2F%2Fmichalmalewicz.medium.com%2Fthe-end-of-dashboards-and-design-systems-5d98ec9de627&source=---read_next_recirc--fc782cf182be----0-----------------bookmark_preview----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n![Image 20: I Woke Up at 4:30 AM Every Day for 30 Days — Here Is What Nobody Tells You](https://miro.medium.com/v2/resize:fit:679/format:webp/1*0XnPmr19m6XJf9vZ9ojJ-Q.png)\n\n[![Image 21: ILLUMINATION](https://miro.medium.com/v2/resize:fill:20:20/1*AZxiin1Cvws3J0TwNUP2sQ.png)](https://medium.com/illumination?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nIn\n\n[ILLUMINATION](https://medium.com/illumination?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nby\n\n[Sufyan Maan, M.Eng](https://medium.com/@sufyanmaan?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[## I Woke Up at 4:30 AM Every Day for 30 Days — Here Is What Nobody Tells You ### Here is what actually happened, from someone who did it & tracked everything.](https://medium.com/illumination/i-woke-up-at-4-30-am-every-day-for-30-days-here-is-what-nobody-tells-you-054bf0160903?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n6d ago\n\n[321](https://medium.com/illumination/i-woke-up-at-4-30-am-every-day-for-30-days-here-is-what-nobody-tells-you-054bf0160903?source=post_page---read_next_recirc--fc782cf182be----1---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---read_next_recirc--fc782cf182be----1-----------------explicit_signal----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F054bf0160903&operation=register&redirect=https%3A%2F%2Fmedium.com%2Fillumination%2Fi-woke-up-at-4-30-am-every-day-for-30-days-here-is-what-nobody-tells-you-054bf0160903&source=---read_next_recirc--fc782cf182be----1-----------------bookmark_preview----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n![Image 22: 6 brain images](https://miro.medium.com/v2/resize:fit:679/format:webp/1*Q-mzQNzJSVYkVGgsmHVjfw.png)\n\n[![Image 23: Write A Catalyst](https://miro.medium.com/v2/resize:fill:20:20/1*KCHN5TM3Ga2PqZHA4hNbaw.png)](https://medium.com/write-a-catalyst?source=post_page---read_next_recirc--fc782cf182be----2---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nIn\n\n[Write A Catalyst](https://medium.com/write-a-catalyst?source=post_page---read_next_recirc--fc782cf182be----2---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nby\n\n[Dr. Patricia Schmidt](https://medium.com/@creatorschmidt?source=post_page---read_next_recirc--fc782cf182be----2---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[## As a Neuroscientist, I Quit These 5 Morning Habits That Destroy Your Brain ### Most people do #1 within 10 minutes of waking (and it sabotages your entire day)](https://medium.com/write-a-catalyst/as-a-neuroscientist-i-quit-these-5-morning-habits-that-destroy-your-brain-3efe1f410226?source=post_page---read_next_recirc--fc782cf182be----2---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nJan 14\n\n[934](https://medium.com/write-a-catalyst/as-a-neuroscientist-i-quit-these-5-morning-habits-that-destroy-your-brain-3efe1f410226?source=post_page---read_next_recirc--fc782cf182be----2---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---read_next_recirc--fc782cf182be----2-----------------explicit_signal----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F3efe1f410226&operation=register&redirect=https%3A%2F%2Fmedium.com%2Fwrite-a-catalyst%2Fas-a-neuroscientist-i-quit-these-5-morning-habits-that-destroy-your-brain-3efe1f410226&source=---read_next_recirc--fc782cf182be----2-----------------bookmark_preview----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n![Image 24: A high-contrast digital graphic with a dark, ethereal blue and purple background. Large, glowing cyan text in the center reads “USING LLMs IS A SKILL.” Below the text are three minimalist neon icons: a stack of books with a quill, a castle tower, and a human brain merged with mechanical gears. Small text at the bottom reads “Based on ‘Learning the Art’ concept.”](https://miro.medium.com/v2/resize:fit:679/format:webp/1*BYQlT0GI6CTqJwwk1bXQkg.png)\n\n[![Image 25: Leo Godin](https://miro.medium.com/v2/resize:fill:20:20/0*kkwZ8D_UzFGPeDg_.png)](https://medium.com/@leo-godin?source=post_page---read_next_recirc--fc782cf182be----3---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[Leo Godin](https://medium.com/@leo-godin?source=post_page---read_next_recirc--fc782cf182be----3---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[## Claude Code is Great ### You Just Need to Learn How to Use It](https://medium.com/@leo-godin/claude-code-is-great-6db35d8685f0?source=post_page---read_next_recirc--fc782cf182be----3---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\nMar 2\n\n[51](https://medium.com/@leo-godin/claude-code-is-great-6db35d8685f0?source=post_page---read_next_recirc--fc782cf182be----3---------------------cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2F%40ignatovich.dm%2Funderstanding-memory-leaks-in-react-how-to-find-and-fix-them-fc782cf182be&source=---read_next_recirc--fc782cf182be----3-----------------explicit_signal----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F6db35d8685f0&operation=register&redirect=https%3A%2F%2Fleo-godin.medium.com%2Fclaude-code-is-great-6db35d8685f0&source=---read_next_recirc--fc782cf182be----3-----------------bookmark_preview----cfbe2043_106c_454f_8e60_f4bde14e8f12--------------)\n\n[See more recommendations](https://medium.com/?source=post_page---read_next_recirc--fc782cf182be---------------------------------------)\n\n[Help](https://help.medium.com/hc/en-us?source=post_page-----fc782cf182be---------------------------------------)\n\n[Status](https://status.medium.com/?source=post_page-----fc782cf182be---------------------------------------)\n\n[About](https://medium.com/about?autoplay=1&source=post_page-----fc782cf182be---------------------------------------)\n\n[Careers](https://medium.com/jobs-at-medium/work-at-medium-959d1a85284e?source=post_page-----fc782cf182be---------------------------------------)\n\n[Press](mailto:pressinquiries@medium.com)\n\n[Blog](https://blog.medium.com/?source=post_page-----fc782cf182be---------------------------------------)\n\n[Privacy](https://policy.medium.com/medium-privacy-policy-f03bf92035c9?source=post_page-----fc782cf182be---------------------------------------)\n\n[Rules](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page-----fc782cf182be---------------------------------------)\n\n[Terms](https://policy.medium.com/medium-terms-of-service-9db0094a1e0f?source=post_page-----fc782cf182be---------------------------------------)\n\n[Text to speech](https://speechify.com/medium?source=post_page-----fc782cf182be---------------------------------------)\n",
        "provider": "jina",
        "fromCache": false,
        "error": null
      }
    }
  ],
  "fetched_at": "2026-04-10T18:29:15.721Z"
}

```

## node bin/webcli.js finance quote AAPL MSFT --asset-type equity
```json
{
  "source": "finance",
  "command": "quote_batch",
  "count": 2,
  "ok": true,
  "asset_type": "equity",
  "results": [
    {
      "ok": true,
      "type": "quote",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "asset_type": "equity",
      "source": "yahoo",
      "price": {
        "value": 260.071,
        "currency": "USD",
        "change": null,
        "change_percent": null
      },
      "fundamentals": {
        "market_cap": null,
        "pe_ratio": null,
        "day_range": {
          "low": 259.023,
          "high": 262.19
        },
        "fifty_two_week_range": {
          "low": 186.06,
          "high": 288.62
        }
      },
      "market": {
        "exchange": "NMS",
        "delayed": false,
        "as_of": "2026-04-10T18:29:10.000Z"
      }
    },
    {
      "ok": true,
      "type": "quote",
      "symbol": "MSFT",
      "name": "Microsoft Corporation",
      "asset_type": "equity",
      "source": "yahoo",
      "price": {
        "value": 370.38,
        "currency": "USD",
        "change": null,
        "change_percent": null
      },
      "fundamentals": {
        "market_cap": null,
        "pe_ratio": null,
        "day_range": {
          "low": 370.03,
          "high": 375.64
        },
        "fifty_two_week_range": {
          "low": 355.67,
          "high": 555.45
        }
      },
      "market": {
        "exchange": "NMS",
        "delayed": false,
        "as_of": "2026-04-10T18:29:14.000Z"
      }
    }
  ],
  "fetched_at": "2026-04-10T18:29:16.686Z"
}

```

## node bin/webcli.js finance quote BTC ETH --asset-type crypto
```json
{
  "source": "finance",
  "command": "quote_batch",
  "count": 2,
  "ok": true,
  "asset_type": "crypto",
  "results": [
    {
      "ok": true,
      "type": "quote",
      "symbol": "BTC",
      "name": "Bitcoin",
      "asset_type": "crypto",
      "source": "coingecko",
      "price": {
        "value": 72947,
        "currency": "USD",
        "change": 1039,
        "change_percent": 1.4452
      },
      "fundamentals": {
        "market_cap": 1459933521086,
        "pe_ratio": null,
        "day_range": {
          "low": 71451,
          "high": 73111
        },
        "fifty_two_week_range": null
      },
      "market": {
        "exchange": null,
        "delayed": false,
        "as_of": "2026-04-10T18:28:58.053Z"
      }
    },
    {
      "ok": true,
      "type": "quote",
      "symbol": "ETH",
      "name": "Ethereum",
      "asset_type": "crypto",
      "source": "coingecko",
      "price": {
        "value": 2246.1,
        "currency": "USD",
        "change": 37.613397,
        "change_percent": 1.70313
      },
      "fundamentals": {
        "market_cap": 271293022899,
        "pe_ratio": null,
        "day_range": {
          "low": 2177.97,
          "high": 2249.73
        },
        "fifty_two_week_range": null
      },
      "market": {
        "exchange": null,
        "delayed": false,
        "as_of": "2026-04-10T18:28:42.529Z"
      }
    }
  ],
  "fetched_at": "2026-04-10T18:29:18.154Z"
}

```

## node bin/webcli.js hf model sentence-transformers/all-MiniLM-L6-v2
```json
{
  "source": "huggingface",
  "command": "model",
  "ok": true,
  "results": {
    "type": "model",
    "id": "sentence-transformers/all-MiniLM-L6-v2",
    "source": "huggingface",
    "card": {
      "author": "sentence-transformers",
      "pipeline_tag": "sentence-similarity",
      "library_name": "sentence-transformers",
      "license": "apache-2.0",
      "downloads": 194504137,
      "likes": 4666,
      "tags": [
        "sentence-transformers",
        "pytorch",
        "tf",
        "rust",
        "onnx",
        "safetensors",
        "openvino",
        "bert",
        "feature-extraction",
        "sentence-similarity",
        "transformers",
        "en",
        "dataset:s2orc",
        "dataset:flax-sentence-embeddings/stackexchange_xml",
        "dataset:ms_marco",
        "dataset:gooaq",
        "dataset:yahoo_answers_topics",
        "dataset:code_search_net",
        "dataset:search_qa",
        "dataset:eli5",
        "dataset:snli",
        "dataset:multi_nli",
        "dataset:wikihow",
        "dataset:natural_questions",
        "dataset:trivia_qa",
        "dataset:embedding-data/sentence-compression",
        "dataset:embedding-data/flickr30k-captions",
        "dataset:embedding-data/altlex",
        "dataset:embedding-data/simple-wiki",
        "dataset:embedding-data/QQP",
        "dataset:embedding-data/SPECTER",
        "dataset:embedding-data/PAQ_pairs",
        "dataset:embedding-data/WikiAnswers",
        "arxiv:1904.06472",
        "arxiv:2102.07033",
        "arxiv:2104.08727",
        "arxiv:1704.05179",
        "arxiv:1810.09305",
        "license:apache-2.0",
        "eval-results",
        "text-embeddings-inference",
        "endpoints_compatible",
        "region:us"
      ],
      "last_modified": "2025-03-06T13:37:44.000Z",
      "gated": false,
      "private": false
    },
    "readme_excerpt": "# all-MiniLM-L6-v2 This is a [sentence-transformers](https://www.SBERT.net) model: It maps sentences & paragraphs to a 384 dimensional dense vector space and can be used for tasks like clustering or semantic search. ## Usage (Sentence-Transformers) Using this model becomes easy when you have [sentence-transformers](https://www.SBERT.net) installed: ``` pip install -U sentence-transformers ``` Then you can use the model like this: ```python from sentence_transformers import SentenceTransformer...",
    "links": {
      "repo": "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2",
      "card": "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2"
    }
  },
  "fetched_at": "2026-04-10T18:29:19.465Z"
}

```

## node bin/webcli.js hf dataset squad
```json
{
  "source": "huggingface",
  "command": "dataset",
  "ok": true,
  "results": {
    "type": "dataset",
    "id": "rajpurkar/squad",
    "source": "huggingface",
    "card": {
      "author": "rajpurkar",
      "license": "cc-by-sa-4.0",
      "task_categories": [
        "question-answering"
      ],
      "languages": [
        "en"
      ],
      "downloads": 138742,
      "likes": 359,
      "tags": [
        "task_categories:question-answering",
        "task_ids:extractive-qa",
        "annotations_creators:crowdsourced",
        "language_creators:crowdsourced",
        "language_creators:found",
        "multilinguality:monolingual",
        "source_datasets:extended|wikipedia",
        "language:en",
        "license:cc-by-sa-4.0",
        "size_categories:10K<n<100K",
        "format:parquet",
        "modality:text",
        "library:datasets",
        "library:pandas",
        "library:mlcroissant",
        "library:polars",
        "arxiv:1606.05250",
        "region:us"
      ],
      "last_modified": "2024-03-04T13:54:37.000Z",
      "gated": false,
      "private": false
    },
    "readme_excerpt": "# Dataset Card for SQuAD ## Table of Contents - [Dataset Card for \"squad\"](#dataset-card-for-squad)   - [Table of Contents](#table-of-contents)   - [Dataset Description](#dataset-description)     - [Dataset Summary](#dataset-summary)     - [Supported Tasks and Leaderboards](#supported-tasks-and-leaderboards)     - [Languages](#languages)   - [Dataset Structure](#dataset-structure)     - [Data Instances](#data-instances)       - [plain_text](#plain_text)     - [Data Fields](#data-fields)       -...",
    "links": {
      "repo": "https://huggingface.co/datasets/squad",
      "card": "https://huggingface.co/datasets/squad"
    }
  },
  "fetched_at": "2026-04-10T18:29:21.744Z"
}

```

## node bin/webcli.js docker image nginx python
```json
{
  "source": "docker",
  "command": "image_batch",
  "count": 2,
  "ok": true,
  "results": [
    {
      "ok": true,
      "type": "image",
      "image": "nginx",
      "source": "dockerhub",
      "data": {
        "name": "nginx",
        "namespace": "library",
        "official": true,
        "description": "Official build of Nginx.",
        "star_count": 21247,
        "pull_count": 12918973936,
        "last_updated": "2026-04-10T07:51:58.478727Z",
        "status": 1
      },
      "links": {
        "repo": "https://hub.docker.com/r/_/nginx"
      }
    },
    {
      "ok": true,
      "type": "image",
      "image": "python",
      "source": "dockerhub",
      "data": {
        "name": "python",
        "namespace": "library",
        "official": true,
        "description": "Python is an interpreted, interactive, object-oriented, open-source programming language.",
        "star_count": 10414,
        "pull_count": 8649668112,
        "last_updated": "2026-04-09T23:11:52.877667Z",
        "status": 1
      },
      "links": {
        "repo": "https://hub.docker.com/r/_/python"
      }
    }
  ],
  "fetched_at": "2026-04-10T18:29:22.873Z"
}

```

## node bin/webcli.js docker tags nginx --limit 5
```json
{
  "source": "docker",
  "command": "tags",
  "ok": true,
  "results": {
    "type": "tags",
    "image": "nginx",
    "source": "dockerhub",
    "count": 5,
    "tags": [
      {
        "name": "mainline-alpine3.23",
        "last_updated": "2026-04-10T07:51:56.558094Z",
        "digest": "sha256:582c496ccf79d8aa6f8203a79d32aaf7ffd8b13362c60a701a2f9ac64886c93d",
        "size": 25988064,
        "architectures": [
          "amd64",
          "unknown",
          "arm",
          "arm64",
          "386",
          "ppc64le",
          "riscv64",
          "s390x"
        ]
      },
      {
        "name": "mainline-alpine",
        "last_updated": "2026-04-10T07:51:50.736152Z",
        "digest": "sha256:582c496ccf79d8aa6f8203a79d32aaf7ffd8b13362c60a701a2f9ac64886c93d",
        "size": 25988064,
        "architectures": [
          "amd64",
          "unknown",
          "arm",
          "arm64",
          "386",
          "ppc64le",
          "riscv64",
          "s390x"
        ]
      },
      {
        "name": "alpine3.23",
        "last_updated": "2026-04-10T07:51:42.364816Z",
        "digest": "sha256:582c496ccf79d8aa6f8203a79d32aaf7ffd8b13362c60a701a2f9ac64886c93d",
        "size": 25988064,
        "architectures": [
          "amd64",
          "unknown",
          "arm",
          "arm64",
          "386",
          "ppc64le",
          "riscv64",
          "s390x"
        ]
      },
      {
        "name": "alpine",
        "last_updated": "2026-04-10T07:51:36.44229Z",
        "digest": "sha256:582c496ccf79d8aa6f8203a79d32aaf7ffd8b13362c60a701a2f9ac64886c93d",
        "size": 25988064,
        "architectures": [
          "amd64",
          "unknown",
          "arm",
          "arm64",
          "386",
          "ppc64le",
          "riscv64",
          "s390x"
        ]
      },
      {
        "name": "1.29.8-alpine3.23",
        "last_updated": "2026-04-10T07:51:26.249823Z",
        "digest": "sha256:582c496ccf79d8aa6f8203a79d32aaf7ffd8b13362c60a701a2f9ac64886c93d",
        "size": 25988064,
        "architectures": [
          "amd64",
          "unknown",
          "arm",
          "arm64",
          "386",
          "ppc64le",
          "riscv64",
          "s390x"
        ]
      }
    ]
  },
  "fetched_at": "2026-04-10T18:29:23.981Z"
}

```

## node bin/webcli.js doctor
```json
{
  "source": "webcli",
  "command": "doctor",
  "node_version": "v24.14.1",
  "total_platforms": 18,
  "dependencies": [
    {
      "name": "gh (GitHub CLI)",
      "status": "ok",
      "version": "gh version 2.88.1 (2026-03-12)",
      "path": "C:\\Program Files\\GitHub CLI\\gh.EXE",
      "install": "winget install GitHub.cli  OR  https://cli.github.com",
      "required_for": "github"
    },
    {
      "name": "yt-dlp",
      "status": "ok",
      "version": "2026.03.17",
      "path": "python",
      "install": "pip install yt-dlp  OR  winget install yt-dlp",
      "required_for": "youtube"
    },
    {
      "name": "twitter-cli",
      "status": "ok",
      "version": "node:internal/errors:542",
      "path": "C:\\Users\\Atharva\\AppData\\Roaming\\npm\\twitter.CMD",
      "install": "npm install -g twitter-cli",
      "required_for": "twitter"
    },
    {
      "name": "python3 / python",
      "status": "ok",
      "version": "Python 3.14.3",
      "path": "C:\\Python314\\python.EXE",
      "install": "https://python.org/downloads",
      "required_for": "reddit (OAuth), youtube (fallback)"
    }
  ],
  "auth": [
    {
      "platform": "github",
      "configured": false
    },
    {
      "platform": "reddit",
      "configured": true
    },
    {
      "platform": "twitter",
      "configured": false
    },
    {
      "platform": "youtube",
      "configured": true
    },
    {
      "platform": "linkedin",
      "configured": false
    }
  ],
  "no_auth_platforms": [
    "hackernews",
    "stackoverflow",
    "arxiv",
    "wikipedia",
    "npm",
    "pypi",
    "devto",
    "weather",
    "read",
    "search",
    "finance",
    "huggingface",
    "docker"
  ],
  "overall": "ok"
}

```

## node bin/webcli.js read https://example.com
```json
{
  "source": "read",
  "command": "read",
  "count": 1,
  "results": [
    {
      "url": "https://example.com",
      "method": "jina",
      "ok": true,
      "word_count": 55,
      "char_count": 403,
      "content": "Title: Example Domain\n\nURL Source: https://example.com/\n\nPublished Time: Fri, 10 Apr 2026 01:29:17 GMT\n\nWarning: This is a cached snapshot of the original page, consider retry with caching opt-out.\n\nMarkdown Content:\n# Example Domain\n\n# Example Domain\n\nThis domain is for use in documentation examples without needing permission. Avoid use in operations.\n\n[Learn more](https://iana.org/domains/example)\n"
    }
  ],
  "fetched_at": "2026-04-10T18:29:28.161Z"
}

```

