import { Box, Modal, Typography } from '@mui/material';
import Iconify from '../../components/iconify';
import SolarMark from './SolarMark';
import { solar } from './tokens';

// ----------------------------------------------------------------------
// SolarSense "Data Privacy Statement" modal, opened from the Register consent
// row. MUI's Modal provides the portal, focus trap, Esc-to-close, backdrop
// click-to-close, and background scroll lock; the styling follows the spec.
// ----------------------------------------------------------------------

const BODY_TEXT = '#4A4536';

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function PrivacyModal({ open, onClose, onAgree }: PrivacyModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="privacy-modal-title"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: '16px', sm: '48px' } }}
      slotProps={{ backdrop: { sx: { background: 'rgba(20,14,4,.55)', backdropFilter: 'blur(4px)' } } }}
    >
      <Box
        sx={{
          width: 640,
          maxWidth: '100%',
          maxHeight: '100%',
          background: solar.paper,
          borderRadius: '22px',
          boxShadow: '0 40px 100px rgba(10,8,2,.55)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      >
        {/* Header */}
        <Box sx={{ position: 'relative', p: '30px 34px 22px', flexShrink: 0 }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: 5,
              width: '100%',
              background: `linear-gradient(90deg, ${solar.accent}, #FFE082)`,
            }}
          />
          <Box
            component="button"
            type="button"
            onClick={onClose}
            aria-label="Close"
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 38,
              height: 38,
              border: 'none',
              borderRadius: '10px',
              background: '#F1ECE0',
              color: '#6B6455',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .15s',
              '&:hover': { background: '#E7E0D0' },
            }}
          >
            <Iconify icon="eva:close-fill" width={20} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mt: '8px' }}>
            <SolarMark size={38} />
            <Box>
              <Typography
                sx={{
                  fontFamily: solar.fontDisplay,
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  color: solar.accentDeep,
                  m: 0,
                }}
              >
                SolarSense
              </Typography>
              <Typography
                id="privacy-modal-title"
                component="h3"
                sx={{
                  fontFamily: solar.fontDisplay,
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '-.01em',
                  color: solar.ink,
                  m: '2px 0 0',
                }}
              >
                Data Privacy Statement
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Scrollable body */}
        <Box
          sx={{
            p: '4px 34px 8px',
            overflowY: 'auto',
            flex: 1,
            fontFamily: solar.fontBody,
            '& h4': {
              fontFamily: solar.fontDisplay,
              fontSize: '15px',
              fontWeight: 600,
              color: solar.ink,
              margin: '22px 0 6px',
            },
            '& h4:first-of-type': { marginTop: '8px' },
            '& p': { fontSize: '14.5px', lineHeight: 1.6, color: BODY_TEXT, margin: 0 },
            '& p + p': { marginTop: '8px' },
            '& ul': { margin: '6px 0 0', paddingLeft: '20px' },
            '& li': { fontSize: '14.5px', lineHeight: 1.6, color: BODY_TEXT, margin: '2px 0' },
            '& a': { color: solar.accentDeep, fontWeight: 600, textDecoration: 'none' },
            '& .updated': {
              fontSize: '12.5px',
              fontWeight: 600,
              letterSpacing: '.02em',
              color: solar.muted,
              margin: '6px 0 0',
            },
          }}
        >
          <p className="updated">LAST UPDATED · JULY 2, 2026</p>

          <h4>1. Introduction</h4>
          <p>
            We value your privacy and are committed to protecting your personal information. This Privacy Policy
            explains what information we collect, how we use it, and the choices you have regarding your data when using
            our Services.
          </p>
          <p>
            By using our Services, you agree to the collection and use of your information as described in this Privacy
            Policy.
          </p>

          <h4>2. Information We Collect</h4>
          <p>When you create an account or use our Services, we collect the following information:</p>
          <ul>
            <li>
              <b>Name</b>
            </li>
            <li>
              <b>Email address</b>
            </li>
            <li>
              <b>Password</b> (stored securely in encrypted or hashed form)
            </li>
            <li>
              <b>Location</b> that you provide to receive location-specific solar data, analysis, and insights
            </li>
          </ul>
          <p>We only collect the information that is necessary to provide and improve our Services.</p>

          <h4>3. How We Use Your Information</h4>
          <p>We use your information to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Authenticate your identity when you sign in.</li>
            <li>Deliver solar-related information based on the location you provide.</li>
            <li>Generate AI-powered insights, recommendations, and analysis.</li>
            <li>Respond to support requests and communicate important updates about the Service.</li>
            <li>Maintain the security, reliability, and functionality of our platform.</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
          <p>
            We do <b>not</b> sell your personal information to third parties.
          </p>

          <h4>4. AI Processing</h4>
          <p>
            Our Services use artificial intelligence (AI) to process the information you provide in order to generate
            solar-related insights, recommendations, and other useful features.
          </p>
          <p>
            AI-generated content is intended to assist users and should be considered informational. While we strive to
            provide accurate and reliable results, AI-generated responses may occasionally contain inaccuracies or
            omissions.
          </p>

          <h4>5. Legal Basis for Processing (GDPR)</h4>
          <p>
            If you are located in the European Economic Area (EEA), we process your personal data based on one or more
            of the following legal bases:
          </p>
          <ul>
            <li>Performance of a contract to provide our Services.</li>
            <li>Legitimate interests in operating, maintaining, improving, and securing our Services.</li>
            <li>Compliance with applicable legal obligations.</li>
          </ul>

          <h4>6. Data Sharing</h4>
          <p>We do not sell or rent your personal information.</p>
          <p>
            We may share your information only with trusted third-party service providers that are necessary to operate
            the Service, such as cloud hosting, authentication, database, or AI service providers. These providers
            process your information solely for the purpose of delivering the requested functionality and are expected
            to protect your information in accordance with applicable laws.
          </p>

          <h4>7. Data Retention</h4>
          <p>
            We retain your personal information only for as long as your account remains active or as long as necessary
            to provide our Services and comply with applicable legal obligations.
          </p>
          <p>
            If you request deletion of your account, we will delete your personal data within a reasonable period unless
            we are legally required to retain certain information.
          </p>

          <h4>8. Data Security</h4>
          <p>
            We implement reasonable technical and organizational measures designed to protect your personal information
            against unauthorized access, disclosure, alteration, or destruction.
          </p>
          <p>
            However, no method of electronic transmission or storage is completely secure, and therefore we cannot
            guarantee absolute security.
          </p>

          <h4>9. Your Rights</h4>
          <p>Depending on your location and applicable law, you may have the right to:</p>
          <ul>
            <li>Access your personal information.</li>
            <li>Correct inaccurate or incomplete information.</li>
            <li>Request deletion of your personal data.</li>
            <li>Restrict or object to certain processing activities.</li>
            <li>Request a copy of your personal data where applicable.</li>
            <li>Withdraw your consent where processing is based on your consent.</li>
          </ul>
          <p>To exercise any of these rights, please contact us using the email address provided below.</p>

          <h4>10. Changes to This Privacy Policy</h4>
          <p>
            We may update this Privacy Policy from time to time as our Services evolve or legal requirements change.
          </p>
          <p>
            When changes are made, we will update the “Last Updated” date at the top of this page. Continued use of the
            Services after such updates constitutes your acceptance of the revised Privacy Policy.
          </p>

          <h4>11. Contact Us</h4>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please
            contact us at:
          </p>
          <p>
            <b>Email:</b> <a href="mailto:createwithsatvik@gmail.com">createwithsatvik@gmail.com</a>
          </p>

          <h4>12. Independent Project Notice</h4>
          <p>
            This Service is independently designed and developed as a solo project. Every reasonable effort has been
            made to implement appropriate privacy and security practices and to comply with applicable data protection
            laws.
          </p>
          <p>
            As the project continues to evolve, there may occasionally be unintentional omissions or inaccuracies in
            this Privacy Policy or in our privacy practices. If you believe you have identified a privacy-related issue
            or have concerns about how your data is handled, please contact us. We are committed to reviewing the issue
            promptly and making appropriate corrections where necessary.
          </p>
          <p>
            Nothing in this notice limits or excludes any rights or protections that you may have under applicable law.
          </p>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            p: '20px 34px 26px',
            borderTop: `1px solid ${solar.line}`,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: '12.5px', color: solar.muted, m: 0 }}>
            Scroll to review the full statement
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={onAgree}
            sx={{
              height: 46,
              padding: '0 28px',
              border: 'none',
              borderRadius: '12px',
              background: solar.accent,
              color: solar.ink,
              fontFamily: solar.fontDisplay,
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 20px rgba(255,193,7,.35)',
              transition: 'filter .15s',
              '&:hover': { filter: 'brightness(.96)' },
            }}
          >
            I understand &amp; agree
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
