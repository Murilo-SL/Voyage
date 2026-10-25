// =============================================
// API.JS - Funções compartilhadas do Voyage
// =============================================

async function buscarNoticias() {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('publicada', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar notícias:', error);
        return [];
    }
    return data || [];
}

async function buscarParceiros() {
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar parceiros:', error);
        return [];
    }
    return data || [];
}

async function buscarRegioes() {
    const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao buscar regiões:', error);
        return [];
    }
    return data || [];
}