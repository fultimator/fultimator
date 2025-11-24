// ErrorBoundary.js
import React, { Component } from "react";
import {
  Button,
  Container,
  Typography,
  List,
  ListItem,
  TextField,
  Box,
} from "@mui/material";
import axios from "axios";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorList: [],
      message: "", // State for the message input
      contact: "", // State for the contact input (email or Discord)
      formSubmitted: false, // State to track if the form has been submitted
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by Error Boundary:", error, errorInfo);
    this.setState((prevState) => ({
      errorList: [...prevState.errorList, { error, errorInfo }],
    }));
  }

  handleMessageChange = (event) => {
    this.setState({ message: event.target.value });
  };

  handleContactChange = (event) => {
    this.setState({ contact: event.target.value });
  };

  handleSendError = () => {
    const { errorList, message, contact } = this.state;

    // Validate input fields
    if (!contact || !message) {
      if (window.electron) {
        window.electron.alert(
          "Both message and contact information are required."
        );
      } else {
        alert("Both message and contact information are required.");
      }
      return;
    }

    // Truncate message if it exceeds 2000 characters
    const truncatedMessage =
      message.length > 2000 ? message.slice(0, 2000) : message;

    // Truncate error details if they are too long
    const truncatedErrors = errorList.map((errorDetail) => ({
      error: {
        message:
          errorDetail.error.message.length > 2000
            ? errorDetail.error.message.slice(0, 2000)
            : errorDetail.error.message,
        stack:
          errorDetail.error.stack.length > 2000
            ? errorDetail.error.stack.slice(0, 2000)
            : errorDetail.error.stack,
      },
    }));

    // Prepare error report content
    const reportContent = `Error Report:\n\n${truncatedErrors
      .map(
        (errorDetail, index) =>
          `Error ${index + 1}: ${errorDetail.error.message}\nStack Trace: ${
            errorDetail.error.stack
          }`
      )
      .join(
        "\n\n"
      )}\n\nUser Message: ${truncatedMessage}\n\nContact Info: ${contact}`;

    // Send a message to a Discord webhook
    axios
      .post(import.meta.env.VITE_DISCORD_REPORT_BUG_WEBHOOK_URL, {
        content: reportContent,
      })
      .then(() => {
        if (window.electron) {
          window.electron.alert("Error report sent successfully!");
        } else {
          alert("Error report sent successfully!");
        }

        this.setState({ formSubmitted: true });
      })
      .catch((err) => {
        console.error("Failed to send error report:", err);
        if (window.electron) {
          window.electron.alert("Failed to send error report.");
        } else {
          alert("Failed to send error report.");
        }
      });
  };

  render() {
    if (this.state.hasError) {
      if (this.state.formSubmitted) {
        return (
          <Container>
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
              Thank you for your report. We will look into it.
            </Typography>
            <ReturnHomeButton />
          </Container>
        );
      }

      return (
        <Container>
          <Box mt={2}>
            <Typography variant="h2" gutterBottom color={"error"}>
              Something went wrong. Please report the error below or contact us
              in the Discord server #support channel.
            </Typography>

            <ReturnHomeButton />
            <Box
              mt={2}
              p={2}
              sx={{ background: "white", borderRadius: 1, boxShadow: 1 }}
            >
              <Typography variant="h6" gutterBottom>
                Error Details:
              </Typography>
              <List>
                {this.state.errorList.map((errorDetail, index) => (
                  <ListItem key={index} sx={{ borderBottom: "1px solid #ddd" }}>
                    <Typography variant="body1">
                      <strong>Error:</strong> {errorDetail.error.message}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Stack Trace:</strong> {errorDetail.error.stack}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box mt={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Please provide as much information as possible to help us
                diagnose the issue.
              </Typography>
              <TextField
                label="Your Email/Discord"
                variant="outlined"
                fullWidth
                value={this.state.contact}
                onChange={this.handleContactChange}
                sx={{ mb: 2, background: "white" }}
              />
              <TextField
                label="Your Message"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={this.state.message}
                onChange={this.handleMessageChange}
                inputProps={{ maxLength: 2000 }}
                sx={{ mb: 2, background: "white" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleSendError}
                sx={{ mt: 2 }}
              >
                Send Error Report
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Functional component for the return home button
const ReturnHomeButton = () => {
  const handleReturnHome = () => {
    if (window.electron) {
        window.electron.navigateHome();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleReturnHome}
        sx={{ mt: 2 }}
      >
        Return to Home
      </Button>
      <Button
        href="https://discord.gg/aNEgvHm3Re"
        target="_blank"
        rel="noreferrer"
        variant="contained"
        sx={{ backgroundColor: "#7289da", fontWeight: "bold", mt: 2, ml: 1 }}
      >
        Discord
      </Button>
    </>
  );
};

export default ErrorBoundary;
