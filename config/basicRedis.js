const client = require("../database/redis");

exports.redisConnection = async() => {
    try{
        // await client.connect()
        // console.log("redis client connected successfully");

        // 1. strings -> set,get,mSet,mGet
        await client.mSet({
            'user:101:name': 'Alice Smith',
            'user:101:role': 'Admin',
            'user:101:status': 'Active'
        })

        console.log("Successfully stored multiple keys using MSET.");

        const valuesToFetch = ['user:101:name', 'user:101:role', 'user:101:status', 'user:999:nonexistent'];

        const values = await client.mGet(valuesToFetch)

        console.log("values: ",values);

        valuesToFetch.forEach((key, index) => {
            console.log(`Key: "${key}" -> Value: "${values[index]}"`);
        });


        // 2. List -> lPush,rPush,lRange, lPop,rPop

        await client.del('users')

        await client.lPush("users", ['user:101:name', 'user:101:role', 'user:101:status', 'user:999:nonexistent'] )

        const listValues = await client.lRange('users', 0, -1)

        console.log("list values: ",listValues)

        const lastElement = await client.lPop('users');

        console.log("lastElement: ",lastElement)


        // 3. SET -> SADD, SMembers, SisMember , sRem
        await client.sAdd("Product:Book", ['Udaan', 'Chemistry', 'RD Sharma', 'Godan', 'Ek Raat'] )

        const setValue = await client.sMembers("Product:Book")

        console.log("set Value: ",setValue)

        const member = await client.sIsMember("Product:Book",'Udaan');

        console.log(member)


        // 4. Sorted SET -> zAdd, zRange, zRank , zRem
        await client.zAdd("Blog", [
            {
                score: 100, value: 'blog 1'
            },
            {
                score: 200, value: 'blog 2'
            },
            {
                score: 300, value: 'blog 3'
            },
            {
                score: 500, value: 'blog 4'
            },
            {
                score: 250, value: 'blog 5'
            }
        ] )

        const rangeValues = await client.zRange("Blog", 0, -1) //bydefault ascending order

        console.log("range Value: ",rangeValues)

        const blogWithScores = await client.zRangeWithScores("Blog",0,-1);

        console.log(blogWithScores)

        const blogTwoRank = await client.zRank("Blog",'blog 5')

        console.log("Rank: ",blogTwoRank)


        //hashes -> hset,hGet,hGetAll,hDel

        await client.hSet('Cart:1',{
            name : "Watch",
            description :"digital watch",
            rating:'5'
        })

        const getProductRating = await client.hGet('Cart:1','rating')

        console.log(getProductRating)

        const getAllCartValue = await client.hGetAll('Cart:1');

        console.log(getAllCartValue)

    }catch(error){
        console.log("error occured: ",error)
    }
}