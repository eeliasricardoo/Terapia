const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function resetPassword() {
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) {
        console.error(usersError)
        return
    }

    const targetUser = usersData.users.find(u => u.email === 'paciente@test.com')
    if (!targetUser) {
        console.log('Paciente não encontrado no Supabase Auth.')
        return
    }

    const { error } = await supabase.auth.admin.updateUserById(targetUser.id, {
        password: 'Password123!',
        email_confirm: true
    })
    if (error) {
        console.error(error)
    } else {
        console.log('Senha redefinida para: Password123!')
    }
}
resetPassword()
