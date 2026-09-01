import { LegalShell } from "@/components/legal-shell";
import {
  PUBLIC_LEGAL_EFFECTIVE_DATE,
  PUBLIC_LEGAL_VERSION,
} from "@/lib/legal-release";

export default function TermsPage() {
  return (
    <LegalShell
      title="Website Terms / Términos del Sitio"
      version={PUBLIC_LEGAL_VERSION}
      effectiveDate={PUBLIC_LEGAL_EFFECTIVE_DATE}
      showReleaseGate={false}
    >
      <h2>English</h2>
      <h3>Website purpose</h3>
      <p>This website provides general information about Local Lead Forge and allows businesses to request a demo. Submitting a form does not create a client relationship, guarantee acceptance, or form a service agreement.</p>
      <h3>Services and pricing</h3>
      <p>Any actual engagement requires a separate written scope or agreement that confirms services, responsibilities, timing, pricing, and payment terms. If website information conflicts with a signed agreement, the signed agreement controls.</p>
      <h3>No guaranteed outcomes</h3>
      <p>Local Lead Forge does not guarantee a specific number of leads, appointments, sales, revenue, search rankings, or return on investment. Outcomes depend on factors outside our control, including traffic, market conditions, client operations, and follow-up.</p>
      <h3>Acceptable use</h3>
      <p>You may not misuse the website, attempt unauthorized access, interfere with its operation, submit unlawful or deceptive content, or use automated methods that create unreasonable load.</p>
      <h3>Third-party services</h3>
      <p>Social-network links and other third-party services are provided for convenience and remain subject to the applicable provider&apos;s terms and availability.</p>
      <h3>Changes</h3>
      <p>We may update these website terms as the public site changes. Separate customer agreements and data-processing terms remain subject to their own approval and version controls.</p>

      <hr />

      <h2>Español</h2>
      <h3>Propósito del sitio</h3>
      <p>Este sitio ofrece información general sobre Local Lead Forge y permite que los negocios soliciten una demo. Enviar un formulario no crea una relación de cliente, no garantiza aceptación ni constituye un acuerdo de servicio.</p>
      <h3>Servicios y precios</h3>
      <p>Cualquier contratación real requiere un alcance o acuerdo escrito independiente que confirme servicios, responsabilidades, tiempos, precios y condiciones de pago. Si la información del sitio contradice un acuerdo firmado, prevalece el acuerdo firmado.</p>
      <h3>Sin resultados garantizados</h3>
      <p>Local Lead Forge no garantiza una cantidad específica de oportunidades, citas, ventas, ingresos, posiciones en buscadores ni retorno sobre la inversión. Los resultados dependen de factores fuera de nuestro control, como tráfico, mercado, operación del cliente y seguimiento.</p>
      <h3>Uso aceptable</h3>
      <p>No puedes usar indebidamente el sitio, intentar accesos no autorizados, interferir con su operación, enviar contenido ilegal o engañoso ni utilizar métodos automatizados que generen una carga irrazonable.</p>
      <h3>Servicios externos</h3>
      <p>Los enlaces a redes sociales y otros servicios externos se ofrecen por conveniencia y están sujetos a las condiciones y disponibilidad de cada proveedor.</p>
      <h3>Cambios</h3>
      <p>Podemos actualizar estos términos cuando cambie el sitio público. Los acuerdos de clientes y términos de procesamiento de datos permanecen sujetos a sus propios controles de aprobación y versión.</p>
    </LegalShell>
  );
}
