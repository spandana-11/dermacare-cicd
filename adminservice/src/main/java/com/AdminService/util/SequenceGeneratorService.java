package com.AdminService.util;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.AdminService.entity.IdCounter;

@Service
public class SequenceGeneratorService {

    @Autowired
    private MongoOperations mongoOperations;

    public int getNextSequence(String key) {
        Query query = new Query(Criteria.where("_id").is(key));
        Update update = new Update().inc("sequence", 1);
        FindAndModifyOptions options = FindAndModifyOptions.options().returnNew(true).upsert(true);

        IdCounter counter = mongoOperations.findAndModify(query, update, options, IdCounter.class);
        return counter != null ? counter.getSequence() : 1;
    }
}