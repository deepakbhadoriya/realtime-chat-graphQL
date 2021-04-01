import React, { useState } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  gql,
  useMutation,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { Container, Row, Col, FormInput, Button } from 'shards-react';

const link = new WebSocketLink({
  uri: 'ws://localhost:4000/',
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);

  if (!data) {
    return null;
  }

  return (
    data.messages &&
    data.messages.map(({ id, user: messageUser, content }) => (
      <div
        style={{
          display: 'flex',
          justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
          paddingBottom: '1em',
        }}
      >
        {user !== messageUser && (
          <div
            style={{
              height: 50,
              width: 50,
              marginRight: '0.5em',
              border: '2px solid #e5e6ea',
              borderRadius: 25,
              textAlign: 'center',
              fontSize: '18pt',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            {messageUser.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div
          style={{
            background: user === messageUser ? '#58bf56' : '#e5e6ea',
            color: user === messageUser ? 'white' : 'black',
            padding: '1em',
            borderRadius: '1em',
            maxWidth: '60%',
          }}
        >
          {content}
        </div>
      </div>
    ))
  );
};

const Chat = () => {
  const [state, setState] = useState({
    user: 'deepak',
    content: '',
  });

  const [postMessage] = useMutation(POST_MESSAGE);

  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      });
    }
    setState({
      ...state,
      content: '',
    });
  };

  return (
    <Container>
      <Messages user={state.user} />
      <Row>
        <Col xs={2} style={{ padding: 0 }}>
          <FormInput
            label="User"
            value={state.user}
            onChange={(e) => setState({ ...state, user: e.target.value })}
          />
        </Col>
        <Col xs={8}>
          <FormInput
            label="Content"
            value={state.content}
            onChange={(e) => setState({ ...state, content: e.target.value })}
            onKeyUp={(e) => e.keyCode === 13 && onSend()}
          />
        </Col>
        <Col xs={2} style={{ padding: 0 }}>
          <Button onClick={() => onSend()} style={{ width: '100%' }}>
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
