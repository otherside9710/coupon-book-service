## 📚 Tech Challenge: Diseño de API para un Servicio de Cuponera

### 🎯 Resumen del Servicio
El objetivo es diseñar una arquitectura de alto nivel y una API RESTful para un servicio que permite a negocios **crear, distribuir y gestionar cupones**[cite: 2, 3].

### 🛠️ Funcionalidades Clave Requeridas
El servicio debe soportar las siguientes operaciones[cite: 4, 5]:
* Creación de libros de cupones (**Coupon Books**)[cite: 4, 37].
* Asignación de cupones a usuarios[cite: 4, 39].
* Carga de una lista de códigos a un libro de cupones existente, o generación de códigos por la API siguiendo un patrón hasta un total especificado[cite: 5].
* Bloqueo temporal de cupones durante intentos de canje (**Lock**)[cite: 4, 40, 41].
* Canje definitivo de cupones (**Redeem**)[cite: 4, 42].

### ⚙️ Parámetros y Consideraciones Específicas
Se deben tomar en cuenta los siguientes parámetros y opciones a nivel de *Coupon Book*[cite: 6, 7, 8, 9]:
1.  Los códigos de un libro de cupones pueden, **opcionalmente**, ser canjeados más de una vez por usuario (parámetro de libro de cupones)[cite: 7].
2.  El número máximo de códigos de un *Coupon Book* que puede ser asignado por miembro puede ser **opcionalmente** especificado (parámetro de libro de cupones)[cite: 8].
3.  Se permite introducir cualquier restricción o suposición necesaria para agilizar el proceso[cite: 9].

### ⚠️ Problemas de Diseño Esperados a Abordar
1.  Gestión del estado y bloqueo de bases de datos (SQL o NoSQL) **correctos**[cite: 11].
2.  Lógica de generación y canje de códigos[cite: 12].
3.  Lógica de aleatoriedad al asignar códigos de cupón[cite: 13].
4.  Manejo de concurrencia para prevenir condiciones de carrera y asegurar la integridad de los datos, especialmente en el canje de cupones[cite: 19, 31].

### 🏛️ Deliverables Clave
1.  **Arquitectura del Sistema de Alto Nivel**: Incluyendo tecnologías, bases de datos y servicios *cloud* (AWS o GCP)[cite: 21, 15, 16].
2.  **Diseño de Base de Datos de Alto Nivel**[cite: 22].
3.  **Endpoints de API RESTful**: Incluyendo formatos de solicitud y respuesta, y cómo interactúan con los componentes del sistema[cite: 24, 17].
4.  **Pseudocódigo para Operaciones Clave**: Al menos para tres operaciones críticas (asignar, bloquear, canjear)[cite: 25, 26].
5.  **Estrategia de Despliegue de Alto Nivel**: Describir el despliegue en una plataforma *cloud* (AWS o GCP), considerando escalabilidad y disponibilidad[cite: 27].
6.  Consideraciones de **Seguridad y Rendimiento** (alto volumen de solicitudes)[cite: 18].

### 🔗 Endpoints de API Esperados (Ejemplos)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/coupons` | Crea un nuevo libro de cupones (*Coupon Book*)[cite: 37, 46]. |
| `POST` | `/coupons/codes` | Carga una lista de códigos a un *Coupon Book* existente (si no fue generado)[cite: 38, 47]. |
| `POST` | `/coupons/assign` | Asigna un nuevo código de cupón **aleatorio** a un usuario[cite: 39, 49]. |
| `POST` | `/coupons/assign/{code}` | Asigna un código de cupón **dado** a un usuario[cite: 39, 50]. |
| `POST` | `/coupons/lock/{code}` | Bloquea temporalmente un cupón para canje. El código debe estar asignado previamente[cite: 40, 41]. |
| `POST` | `/coupons/redeem/{code}` | Canjea un cupón (operación de bloqueo permanente). El código debe estar asignado previamente[cite: 42, 52]. |
| `GET` | `/users/{user_id}/coupons` | Obtener los códigos de cupón asignados al usuario (Uso esperado)[cite: 53]. |

### 🔑 Operaciones Clave para Pseudocódigo
* Asignar un cupón a un usuario[cite: 25].
* Bloquear un cupón[cite: 25].
* Canjear un cupón[cite: 25].