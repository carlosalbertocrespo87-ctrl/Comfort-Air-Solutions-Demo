import { LegalShell } from "@/components/legal-shell";
import {
  PUBLIC_LEGAL_EFFECTIVE_DATE,
  PUBLIC_LEGAL_VERSION,
} from "@/lib/legal-release";

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy / Política de Privacidad"
      version={PUBLIC_LEGAL_VERSION}
      effectiveDate={PUBLIC_LEGAL_EFFECTIVE_DATE}
      showReleaseGate={false}
    >
      <h2>English</h2>
      <h3>Information we collect</h3>
      <p>Local Lead Forge collects the information you choose to provide through the demo-request form, such as your name, business name, email address, phone number, and details about the lead-flow issue you want to improve. Our hosting and form-processing providers may also process basic technical and security logs needed to operate and protect the website.</p>
      <h3>How we use information</h3>
      <p>We use this information to respond to your request, evaluate whether our services may fit your business, operate and secure the website, maintain appropriate business records, and comply with applicable obligations.</p>
      <h3>Service providers and sharing</h3>
      <p>We may share information with providers that support website hosting, form processing, communications, and security, only as reasonably necessary to provide those functions. We do not sell personal information.</p>
      <h3>Text messages</h3>
      <p>If you separately choose the optional SMS consent in a form, Local Lead Forge may send text messages about that request. Message and data rates may apply. Reply STOP to opt out. Choosing SMS is optional.</p>
      <h3>Retention and your choices</h3>
      <p>We retain information only as reasonably necessary to handle the request, maintain security and business records, and meet applicable obligations. You may ask about, correct, or request deletion of information you submitted by contacting us at the email below.</p>
      <h3>Children and external services</h3>
      <p>This business-to-business website is not directed to children under 18. Links to social networks and other third-party services are governed by those providers&apos; own privacy practices.</p>
      <h3>Updates</h3>
      <p>We may update this policy as the website and service providers change. The version and effective date shown above identify the current public notice.</p>

      <hr />

      <h2>Español</h2>
      <h3>Información que recopilamos</h3>
      <p>Local Lead Forge recopila la información que decides proporcionar mediante el formulario de solicitud de demo, como tu nombre, negocio, correo electrónico, teléfono y detalles sobre el problema del flujo de oportunidades que deseas mejorar. Nuestros proveedores de alojamiento y procesamiento de formularios también pueden procesar registros técnicos y de seguridad básicos necesarios para operar y proteger el sitio.</p>
      <h3>Cómo usamos la información</h3>
      <p>Usamos esta información para responder a tu solicitud, evaluar si nuestros servicios pueden ayudar a tu negocio, operar y proteger el sitio, mantener registros comerciales adecuados y cumplir las obligaciones aplicables.</p>
      <h3>Proveedores y divulgación</h3>
      <p>Podemos compartir información con proveedores que apoyan el alojamiento, procesamiento de formularios, comunicaciones y seguridad, únicamente cuando sea razonablemente necesario para esas funciones. No vendemos información personal.</p>
      <h3>Mensajes de texto</h3>
      <p>Si eliges por separado el consentimiento opcional para SMS en un formulario, Local Lead Forge podrá enviarte mensajes relacionados con esa solicitud. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar. Elegir SMS es opcional.</p>
      <h3>Retención y tus opciones</h3>
      <p>Conservamos la información solo durante el tiempo razonablemente necesario para atender la solicitud, mantener la seguridad y los registros comerciales y cumplir las obligaciones aplicables. Puedes solicitar información, corrección o eliminación de los datos que enviaste escribiendo al correo indicado abajo.</p>
      <h3>Menores y servicios externos</h3>
      <p>Este sitio entre empresas no está dirigido a menores de 18 años. Los enlaces a redes sociales y otros servicios externos se rigen por las políticas de esos proveedores.</p>
      <h3>Actualizaciones</h3>
      <p>Podemos actualizar esta política cuando cambien el sitio o los proveedores. La versión y fecha efectiva indicadas arriba identifican el aviso público vigente.</p>
    </LegalShell>
  );
}
