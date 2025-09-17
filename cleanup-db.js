// Script para limpiar la base de datos de reseñas duplicadas
const { MongoClient } = require('mongodb');

async function cleanupDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://cristianmunoza2005:admin@clusterreviews.yrlxd.mongodb.net/prog4?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔌 Conectado a MongoDB');

    const db = client.db('prog4');
    const collection = db.collection('reviews');

    // 1. Eliminar todas las reseñas soft-deleted
    const deletedResult = await collection.deleteMany({ status: 'deleted' });
    console.log(`🗑️ Eliminadas ${deletedResult.deletedCount} reseñas con status 'deleted'`);

    // 2. Buscar reseñas duplicadas (mismo userId y bookId)
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: { userId: "$userId", bookId: "$bookId" },
          count: { $sum: 1 },
          docs: { $push: { _id: "$_id", createdAt: "$createdAt" } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();

    console.log(`📊 Encontrados ${duplicates.length} grupos de reseñas duplicadas`);

    // 3. Mantener solo la reseña más reciente de cada duplicado
    for (const duplicate of duplicates) {
      // Ordenar por fecha de creación y mantener solo la más reciente
      const sortedDocs = duplicate.docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const docsToDelete = sortedDocs.slice(1); // Eliminar todas excepto la primera (más reciente)

      for (const doc of docsToDelete) {
        await collection.deleteOne({ _id: doc._id });
        console.log(`🗑️ Eliminada reseña duplicada: ${doc._id}`);
      }
    }

    // 4. Mostrar estadísticas finales
    const totalReviews = await collection.countDocuments();
    const activeReviews = await collection.countDocuments({ status: 'active' });
    
    console.log(`✅ Limpieza completada`);
    console.log(`📊 Total de reseñas: ${totalReviews}`);
    console.log(`📊 Reseñas activas: ${activeReviews}`);

  } catch (error) {
    console.error('💥 Error durante la limpieza:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

cleanupDatabase();