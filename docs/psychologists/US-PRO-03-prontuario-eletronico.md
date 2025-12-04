# US-PRO-03: Prontuário Eletrônico

**Como** psicólogo,
**Quero** registrar e consultar anotações sobre os pacientes,
**Para** manter o acompanhamento clínico.

## Critérios de Aceite
- [ ] **Editor Rico:** Suporte a negrito, listas e parágrafos.
- [ ] **Histórico:** Lista cronológica de evoluções (sessão por sessão).
- [ ] **Privacidade:** O conteúdo deve ser visível **apenas** para o psicólogo que criou. Nem mesmo admins devem ter acesso fácil.
- [ ] **Imutabilidade:** Anotações assinadas digitalmente (timestamp de criação/edição). Edições devem gerar nova versão ou log de alteração.

## Cenários de Exceção
*   **Perda de Dados:** Auto-save a cada 30 segundos no frontend.
*   **Acesso Indevido:** Se um psicólogo tentar acessar prontuário de paciente de outro (sem vínculo), bloquear e logar tentativa de segurança.

## Especificação Técnica

### Frontend
*   **Página:** `/app/pro/pacientes/[id]`
*   **Lib:** `TipTap` (Headless editor) ou `Slate.js`.
*   **Componentes:** `MedicalRecordTimeline`, `RichTextEditor`.

### Backend
*   **Tabela `medical_records`:**
    *   `id`: uuid
    *   `patient_id`: uuid
    *   `psychologist_id`: uuid
    *   `content_encrypted`: text (Base64 do conteúdo cifrado)
    *   `iv`: text (Vetor de inicialização)
*   **Criptografia (Encryption at Rest):**
    *   Usar `pgcrypto` ou criptografia na camada de aplicação (Node.js `crypto` module) usando uma chave mestra de aplicação (`CMS_ENCRYPTION_KEY`).
    *   *Melhor prática:* Chave derivada do psicólogo (KDF) para que nem o banco tenha acesso, mas para MVP usar chave de servidor é aceitável com RLS estrito.
*   **RLS Policy:**
    ```sql
    CREATE POLICY "Psychologist can view own records" ON medical_records
    FOR ALL USING (auth.uid() = psychologist_id);
    ```
