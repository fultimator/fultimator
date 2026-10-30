import React from "react";
import { Box, Typography } from "@mui/material";

interface State {
  hasError: boolean;
}

export class MessageListErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="error">
            Chat failed to render. Try clearing the chat log.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}
