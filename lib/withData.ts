// configs for the apollo client

import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { getDataFromTree } from "@apollo/client/react/ssr";
import { createUploadLink } from "apollo-upload-client";
import withApollo from "next-with-apollo";
import { endpoint, prodEndpoint } from "../config";

type withDataProps = {
	initialState?: any;
	headers?: any;
};

function withData({ headers, initialState }: withDataProps): ApolloClient<any> {
	return new ApolloClient({
		link: ApolloLink.from([
			onError(({ graphQLErrors, networkError }) => {
				if (graphQLErrors)
					graphQLErrors.forEach(({ message, locations, path }) =>
						console.log(
							`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
						)
					);
				if (networkError)
					console.log(
						`[Network error]: ${networkError}. Backend is unreachable. Is it running?`
					);
			}),
			createUploadLink({
				uri: process.env.NODE_ENV === "development" ? endpoint : prodEndpoint,
				fetchOptions: {
					credentials: "include",
				},
				headers,
			}),
		]),
		cache: new InMemoryCache().restore(initialState || {}),
	});
}

export default withApollo(withData, { getDataFromTree });
