import * as joi from 'joi'
import jdate from '@joi/date'

joi.extend(jdate)
import {NextFunction, Request, Response} from "express";

const Validate = (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (req: Request, _res: Response, next: NextFunction) {
        const {error} = originalMethod.call(this).validate(req, {allowUnknown: true})
        if (error) {
            return next(error.message)
        }
        next()
    }
}

class Validator {
    @Validate
    message() {
        return joi.object({
            body: joi.object({
                sender: joi.string().required(),
                text: joi.string().min(1).max(100).required(),
            }),
            params: joi.object({
                to: joi.string().guid().required()
            })

        })
    }
    @Validate
    to() {
        return joi.object({
            params: joi.object({
                to: joi.string().guid(),
                id: joi.string().guid()
            })
        })
    }
    @Validate
    from() {
        return joi.object({
            body: joi.object({user: joi.string().guid().required()})
        })
    }
    @Validate
    options() {
        return joi.object({
            body: joi.object({
                date: joi.date().iso()
            })
        })
    }

}

export default Validator