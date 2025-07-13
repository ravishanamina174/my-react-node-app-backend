import mongoose from "mongoose"
import {z} from "zod"

const CreateProductDTO = z.object({

  categoryId:z.string().min(1),
  name:z.string().min(1),  
  iamge:z.string().min(1),
  stock:z.number(),
  price:z.number().nonnegative()  
})

export {CreateProductDTO };