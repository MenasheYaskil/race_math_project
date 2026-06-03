package com.innovativelearning.persist;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class Persist {
    private final SessionFactory sessionFactory;

    public Persist(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    public void save(Object entity) {
        try (Session session = sessionFactory.openSession()) {
            Transaction tx = session.beginTransaction();
            session.persist(entity);
            tx.commit();
        }
    }

    public void update(Object entity) {
        try (Session session = sessionFactory.openSession()) {
            Transaction tx = session.beginTransaction();
            session.merge(entity);
            tx.commit();
        }
    }

    public <T> T get(Class<T> clazz, Long id) {
        try (Session session = sessionFactory.openSession()) {
            return session.get(clazz, id);
        }
    }

    public <T> List<T> list(Class<T> clazz) {
        try (Session session = sessionFactory.openSession()) {
            return session.createQuery("from " + clazz.getSimpleName(), clazz).list();
        }
    }

    public <T> List<T> executeQuery(String hql, Map<String, Object> params, Class<T> clazz) {
        try (Session session = sessionFactory.openSession()) {
            Query<T> query = session.createQuery(hql, clazz);
            if (params != null) {
                for (Map.Entry<String, Object> entry : params.entrySet()) {
                    query.setParameter(entry.getKey(), entry.getValue());
                }
            }
            return query.list();
        }
    }
    
    public <T> T executeQuerySingle(String hql, Map<String, Object> params, Class<T> clazz) {
        List<T> results = executeQuery(hql, params, clazz);
        return results.isEmpty() ? null : results.get(0);
    }
}
