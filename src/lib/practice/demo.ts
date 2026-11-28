import type { ChatMessage } from "../byok";
import type { ModeId } from "./modes";

/** Demo transcripts shown when there is no key. Invented on purpose: a made-up company and numbers. */
export const DEMO: Record<ModeId, ChatMessage[]> = {
  consultoria: [
    {
      role: "assistant",
      content:
        "Caso ficticio: una cadena de panaderías de barrio con 40 tiendas en Andalucía ha visto caer su beneficio un 15 % en dos años. El dueño te pide ayuda. Antes de nada: ¿qué preguntas me harías y cómo ordenarías el problema?",
    },
    {
      role: "user",
      content:
        "Primero querría saber si el objetivo es recuperar el beneficio anterior y en qué plazo. Dividiría el beneficio en ingresos y costes, y los ingresos en clientes por tienda por ticket medio.",
    },
    {
      role: "assistant",
      content:
        "Buen arranque: has fijado el objetivo y has abierto dos ramas. Te doy datos inventados: los clientes por tienda bajan un 10 % y el ticket medio sube un 2 %. ¿Qué te dice eso y qué mirarías después?",
    },
  ],
  tecnicas: [
    {
      role: "assistant",
      content:
        "Empezamos por contabilidad. Una empresa compra una máquina por 100 al contado y la amortiza en 5 años. ¿Cómo afecta al balance y a la cuenta de resultados en el primer año?",
    },
    {
      role: "user",
      content:
        "En el balance, la caja baja 100 y el inmovilizado sube 100. Al amortizar 20, el inmovilizado baja a 80 y el resultado baja 20 antes de impuestos.",
    },
    {
      role: "assistant",
      content:
        "Correcto. Ahora una vuelta más: ¿cómo aparece ese gasto de 20 en el flujo de caja y por qué no sale caja en ese ajuste?",
    },
  ],
  comportamiento: [
    {
      role: "assistant",
      content:
        "Cuéntame una situación en la que tuviste un desacuerdo serio en un trabajo en grupo. Intenta ordenarla: situación, tarea, qué hiciste tú y cómo acabó.",
    },
    {
      role: "user",
      content:
        "En un trabajo de Finanzas, dos compañeros querían repartir el trabajo de forma distinta y no avanzábamos. Yo propuse reunirnos 20 minutos y apuntar quién hacía qué.",
    },
    {
      role: "assistant",
      content:
        "Vas bien con la situación y tu acción. Falta el resultado: ¿cómo acabó el reparto y qué nota o resultado tuvo el trabajo? ¿Qué harías distinto?",
    },
  ],
};
