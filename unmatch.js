// fetch lib as node http methods SUCK `yarn add global node-fetch` etc
const fetch = require("node-fetch");

const distance = 10;

// x-auth-token - readme.md

const token = "e9ed6005-80c5-4ce3-b15d-fb90adbfc093";

if (!token) {
  throw new Error("No token provided - read the README.md");
}

const headers = {
  "X-Auth-Token": token,
  "content-type": "application/json",
  "User-agent": "Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)",
};

const fetchData = async (url, method = "GET", body) => {
  try {
    const res = await fetch(`https://api.gotinder.com/${url}`, {
      method,
      body,
      headers,
    });
    ("");
    return await res.json();
  } catch (e) {
    console.log("Something broke", e);
  }
};

const unmatch = async (id) => {
  try {
    const res = await fetch(`https://api.gotinder.com/user/matches/${id}`, {
      method: "delete",
      headers: headers,
    });
    return await res.json();
  } catch (e) {
    console.log("Something broke", e);
  }
};

const getMatches = async () => {
  const matches = [];

  const getMatchesInner = async (token = undefined) => {
    try {
      const tokenFrag = token ? `&page_token=${token}` : "";
      const matchRes = (await fetchData(
        `v2/matches?count=60&is_tinder_u=false&locale=pt&${tokenFrag}`
      )) || { data: { matches: [] } };

      matches.push(...matchRes.data.matches);
      //if a token is returned, there are more results, loop its self until none left
      const tokenId = matchRes.data.next_page_token;
      if (tokenId) {
        await getMatchesInner(tokenId);
      }
    } catch (e) {
      console.log(e);
    }
  };

  await getMatchesInner();
  return matches;
};

const getProfile = async (id) => {
  try {
    const res = await fetch(`https://api.gotinder.com/user/${id}?locale=pt`, {
      method: "GET",
      headers: headers,
    });
    return await res.json();
  } catch (e) {
    console.log("Something broke", e);
  }
};

const run = async () => {
  console.log("Starting");
  const firstMatches = await getMatches();
  console.log("Got matches", firstMatches.length);

  for (const match of firstMatches) {
    const id = match.person._id;
    const name = match.person.name;
    console.log("Name: ", name);
    //get profile
    const profile = await getProfile(id);
    const distance_mi = profile.results.distance_mi;
    console.log("Distance: ", distance_mi / 0.621371);
    if (true) {
      await unmatch(match._id);
      console.log("Unmatched");
    }
  }
  console.log("DONE");
  process.exit();
};

run();
