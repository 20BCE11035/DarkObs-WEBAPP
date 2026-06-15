import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
    render,
  } from '@react-email/components'
  import * as React from 'react'
  
  interface ForgotPasswordEmailProps {
    resetUrl: string
  }
  
  export const ForgotPasswordEmail = ({ resetUrl }: ForgotPasswordEmailProps) => {
    return (
      <Html>
        <Head />
        <Preview>Reset your DarkObs password</Preview>
        <Body style={main}>
          <Container style={container}>
            <Img
              src={`${process.env.NEXT_PUBLIC_SERVER_URL}/racoon-email-sent-red.png`}
              width="150"
              height="150"
              alt="DarkObs"
              style={logo}
            />
            <Text style={paragraph}>Hi there,</Text>
            <Text style={paragraph}>
              We received a request to reset your password for your DarkObs account.
              Use the button below to reset your password.
            </Text>
            <Section style={btnContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>
            <Text style={paragraph}>
              This link will expire in 1 hour. If you didn’t request a password reset,
              you can safely ignore this email.
            </Text>
            <Text style={paragraph}>
              Best,
              <br />
              The DarkObs team
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              If you did not request this email, you can safely ignore it.
            </Text>
          </Container>
        </Body>
      </Html>
    )
  }
  
  export const ForgotPasswordEmailHtml = (props: ForgotPasswordEmailProps) =>
    render(<ForgotPasswordEmail {...props} />, { pretty: true })
  
  // Dark Mode Styles
  const main = {
    backgroundColor: '#1e1e1e',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    color: '#ffffff',
  }
  
  const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
  }
  
  const logo = {
    margin: '0 auto',
    filter: 'invert(1)',
  }
  
  const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#e0e0e0',
  }
  
  const btnContainer = {
    textAlign: 'center' as const,
  }
  
  const button = {
    padding: '12px 12px',
    backgroundColor: '#ff0000',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
  }
  
  const hr = {
    borderColor: '#444',
    margin: '20px 0',
  }
  
  const footer = {
    color: '#a0a0a0',
    fontSize: '12px',
  }